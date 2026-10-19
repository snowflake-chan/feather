import { encodeUTF8 } from '@box/mudb/stream';
import { CHUNK_SHIFT } from '@box/schema/voxel/voxel-collision-schema';
import {
  AssetsRDA,
  AssetType,
  VoxelRDA,
  AssetEntryRDA,
  VoxelInfo,
  ProjectRDA,
  DeleteAssetsRDA,
} from '@box/schema/project/project-rda';
import {
  retrieveProject,
  storeProjectJSON,
} from '../project/project-serialize';
import { BuildSystem } from '../type';

const FILE_TYPES: { [ext: string]: AssetType } = {
  js: AssetType.JS_SCRIPT,
  vb: AssetType.VOXEL_MODEL,
  lut: AssetType.COLOR_LUT,
  part: AssetType.PARTICLE_TEXTURE,
  png: AssetType.IMAGE,
  mp3: AssetType.AUDIO,
};

const FILE_EXTENSION: { [t: number]: string } = {};
Object.keys(FILE_TYPES).forEach(
  (x) => (FILE_EXTENSION[FILE_TYPES[x]] = '.' + x),
);
FILE_EXTENSION[AssetType.VOXEL_MODEL] = '';
FILE_EXTENSION[AssetType.JS_SCRIPT] = '';
FILE_EXTENSION[AssetType.CLIENT_JS_SCRIPT] = '';
FILE_EXTENSION[AssetType.PARTICLE_TEXTURE] = '.png';

function escapePath(x: string) {
  return x.replace(/\\/g, `\\`).replace(/\//g, `\/`);
}

function extension(file: string) {
  const parts = file.split('.');
  if (parts.length > 1) {
    return parts[parts.length - 1].toLowerCase();
  }
  return '';
}

function removeExtension(filename: string) {
  return filename.replace(/\..*$/, '');
}

function importAssets(assetDir: any) {
  const result = AssetsRDA.stateSchema.clone(AssetsRDA.stateSchema.identity);
  function importDirRec(prefix: string[], folder: any) {
    const meta = folder['.'];
    if (!meta) {
      return;
    }
    meta.forEach(({ name, dir, size }) => {
      const fileHash = folder[name];
      if (!fileHash) {
        return;
      }
      if (dir) {
        return importDirRec(prefix.concat([name]), fileHash);
      }
      const ext = extension(name);
      if (!(ext in FILE_TYPES)) {
        return;
      }
      const asset = AssetEntryRDA.stateSchema.clone(
        AssetEntryRDA.stateSchema.identity,
      );

      // TODO: figure out how to assign owner/content id here
      asset.contentId = asset.ownerId = 0;

      // TODO: check file contents are consistent
      const type = (asset.type = FILE_TYPES[ext]);
      const fileExt = FILE_EXTENSION[type];
      asset.hash = removeExtension(fileHash) + fileExt;
      asset.size = size;

      // update preview image
      const previewPath = name + '.preview';
      if (previewPath in folder) {
        // TODO: check preview image is valid
        asset.previewImage = removeExtension(folder[previewPath]) + '.png';
      } else if (fileExt === '.png') {
        asset.previewImage = asset.hash;
      } else {
        asset.previewImage = '';
      }

      const assetPath = prefix.slice();
      assetPath.push(removeExtension(name) + '.' + ext);
      result[assetPath.map((x) => escapePath(x)).join('/')] = asset;
    });
  }
  importDirRec([], assetDir);
  return result;
}

type DIRECTORY = {
  [path: string]: {
    hash?: string;
    size: number;
    dir?: DIRECTORY;
  };
};

async function exportAssets(
  bs: BuildSystem,
  assetTable: typeof AssetsRDA.stateSchema.identity,
) {
  function insertFile(
    dir: DIRECTORY,
    path: string[],
    asset: typeof AssetEntryRDA.stateSchema.identity,
  ) {
    if (path.length > 1) {
      let folder = dir[path[0]];
      if (!folder) {
        folder = dir[path[0]] = {
          dir: {},
          size: 0,
        };
      }
      if (folder.dir) {
        return insertFile(folder.dir, path.slice(1), asset);
      } else {
        throw new Error('invalid folder type');
      }
    }
    dir[path[0]] = {
      hash: removeExtension(asset.hash),
      size: asset.size,
    };
    if (asset.previewImage) {
      dir[path[0] + '.preview'] = {
        hash: removeExtension(asset.previewImage),
        size: 0,
      };
    }
  }

  const result: DIRECTORY = {};
  Object.keys(assetTable).forEach((path) =>
    insertFile(result, path.split('/'), assetTable[path]),
  );

  async function uploadDir(dir: DIRECTORY) {
    const meta: {
      name: string;
      dir: boolean;
      size: number;
    }[] = [];
    const json: any = {};
    await Promise.all(
      Object.keys(dir).map(async (name) => {
        const file = dir[name];
        if (file.dir) {
          const hash = await uploadDir(file.dir);
          meta.push({
            name,
            dir: true,
            size: 0,
          });
          json[name] = hash;
        } else if (file.hash) {
          meta.push({
            name,
            dir: false,
            size: file.size,
          });
          json[name] = file.hash;
        }
      }),
    );
    meta.sort((a, b) => (a.name < b.name ? -1 : 1));
    json['.'] = meta;
    return bs.storeJSON(json);
  }

  return uploadDir(result);
}

async function importDeletedAssets(bs: BuildSystem, dir: any) {
  // TODO
  return [];
}

async function exportDeletedAssets(
  bs: BuildSystem,
  deletedAssets: typeof DeleteAssetsRDA.stateSchema.identity,
) {
  // TODO
  return bs.storeJSON({
    '.': [],
  });
}

async function importVoxels(bs: BuildSystem, voxelHash: string) {
  const { data, shape, chunks } = await bs.retrieveJSON(voxelHash);
  const hashes = await Promise.all(
    data.map((h) => bs.storeContent(new Uint8Array(h))),
  );

  const result = VoxelRDA.stateSchema.clone(VoxelRDA.stateSchema.identity);
  result.shape.x = shape.x | 0;
  result.shape.y = shape.y | 0;
  result.shape.z = shape.z | 0;
  result.chunks = chunks.slice();

  // check integrity
  if (
    chunks.length !==
    (result.shape.x * result.shape.y * result.shape.z) >> (3 * CHUNK_SHIFT)
  ) {
    throw new Error('inconsistent voxel shape');
  }
  for (let i = 0; i < chunks.length; ++i) {
    const h = chunks[i];
    if (hashes.indexOf(h) < 0) {
      throw new Error('missing chunk data ' + h);
    }
  }

  return result;
}

async function exportVoxels(bs: BuildSystem, voxels: VoxelInfo) {
  const data: number[][] = [];
  const chunks: { [hash: string]: boolean } = {};

  await Promise.all(
    voxels.chunks.map(async (hash) => {
      if (hash in chunks) {
        return;
      }
      chunks[hash] = true;
      const bytes = await bs.retrieveContent(hash);
      data.push(Array.prototype.slice.call(bytes));
    }),
  );

  return bs.storeContent(
    encodeUTF8(
      JSON.stringify({
        type: 'terrain',
        version: '0.0.0',
        prevHash: '',
        data,
        shape: voxels.shape,
        chunks: voxels.chunks,
      }),
    ),
  );
}

function importBannerImages(dir: any) {
  if (!dir || typeof dir !== 'object') {
    return [];
  }
  const items = dir['.'];
  if (!items || !Array.isArray(items)) {
    return [];
  }
  const result: string[] = [];
  for (let i = 0; i < items.length; ++i) {
    const x = items[i];
    if (!x.name || x.dir) {
      continue;
    }
    if (extension(x.name) === 'png') {
      result.push(removeExtension(dir[x.name]) + '.png');
    }
  }
  return result;
}

async function exportBannerImages(bs: BuildSystem, bannerImages: string[]) {
  const dir: any = {};
  const meta: { name: string; dir: boolean; size: number }[] = [];
  for (let i = 0; i < bannerImages.length; ++i) {
    const name = i + '.png';
    dir[name] = removeExtension(bannerImages[i]);
    meta.push({
      name,
      dir: false,
      size: 0,
    });
  }
  dir['.'] = meta;
  return bs.storeJSON(dir);
}

export async function importProject(bs: BuildSystem, dirHash: string) {
  const dir = await bs.retrieveJSON(
    await bs.build('addMeta', await bs.build('optimizeDir', dirHash)),
  );
  const [voxels, deleteAssets, projectJSON] = await Promise.all([
    importVoxels(bs, dir['voxels.json']),
    importDeletedAssets(bs, dir['.trash']),
    bs.retrieveJSON(dir['project.json']),
  ]);

  // update sub fields
  projectJSON.assets = importAssets(dir['assets']);
  projectJSON.deleteAssets = deleteAssets;
  projectJSON.voxels = voxels;

  // update preview image fields
  projectJSON.info = projectJSON.info || {};
  if (dir['preview.png']) {
    projectJSON.info.previewImage =
      removeExtension(dir['preview.png']) + '.png';
  } else {
    projectJSON.info.previewImage = '';
  }

  // import banner images
  projectJSON.info.bannerImages = importBannerImages(dir['banner']);

  // finally run a retrieve and store cycle to migrate project by brute force
  const baseHash = (await storeProjectJSON(bs, projectJSON)).projectHash;

  // retrieve the final project hash and force a migration
  const { hash, project } = await retrieveProject(bs, baseHash);
  ProjectRDA.stateSchema.free(project);

  // return final good hash
  return hash;
}

export async function exportProject(bs: BuildSystem, projectHash: string) {
  const { project } = await retrieveProject(bs, projectHash);

  const projectJSON = ProjectRDA.stateSchema.toJSON(project);
  delete projectJSON.assets;
  delete projectJSON.voxels;
  delete projectJSON.deleteAssets;
  delete projectJSON.info.bannerImages;

  const previewImage = projectJSON.info.previewImage;
  delete projectJSON.info.previewImage;

  // clear prev Hash
  delete projectJSON.prevHash;

  const [assetsHash, bannerHash, voxelsHash, deletedAssets, projectJSONHash] =
    await Promise.all([
      exportAssets(bs, project.assets),
      exportBannerImages(bs, project.info.bannerImages),
      exportVoxels(bs, project.voxels),
      exportDeletedAssets(bs, project.deleteAssets),
      bs.storeContent(encodeUTF8(JSON.stringify(projectJSON, null, '  '))),
    ]);

  const dirState = {
    '.': [
      {
        name: 'assets',
        dir: true,
        size: 0,
      },
      {
        name: 'banner',
        dir: true,
        size: 0,
      },
      {
        name: '.trash',
        dir: true,
        size: 0,
      },
      {
        name: 'voxels.json',
        dir: false,
        size: 0,
      },
      {
        name: 'project.json',
        dir: false,
        size: 0,
      },
    ],
    'assets': assetsHash,
    'banner': bannerHash,
    '.trash': deletedAssets,
    'voxels.json': voxelsHash,
    'project.json': projectJSONHash,
  };

  if (previewImage) {
    dirState['preview.png'] = removeExtension(previewImage);
    dirState['.'].push({
      name: 'preview.png',
      dir: false,
      size: 0,
    });
  }

  return bs.storeJSON(dirState);
}
