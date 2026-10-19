import fs from 'fs';
import * as fsext from 'fs-extra';
import path from 'path';
import type { Logger } from 'pino';

import { BuildSystem } from '../build-system';
import { ContentServer } from '@box/content-server';
import { decodeUTF8 } from '@box/mudb/stream';
import { uploadDirectory, UploadDirType } from './upload-dir';

function inferType(json: any) {
  switch (typeof json) {
    case 'string':
    case 'number':
    case 'boolean':
      return typeof json;
    case 'object':
      if (Array.isArray(json)) {
        return inferType(json[0]) + '[]';
      } else {
        const result: string[] = [];
        Object.keys(json).forEach((prop, i) => {
          result.push(`'${prop}':${inferType(json[prop])}`);
        });
        return `{ ${result.join('; ')} }`;
      }
  }
  return 'any';
}

function escape(msg: string) {
  if (msg.length > 1000) {
    return escape(msg.substring(0, 1000));
  }
  return msg.replace(/\//g, ' / ');
}

function emitStringLiteral(str: string) {
  return '`' + str.replace(/\$\{/g, "${'${'}").replace(/\`/g, "${'`'}") + '`';
}

/**
 * 保存到 ipfs, 并写入本地 src/assets 目录
 */
async function rebuildResources(
  buildSystem: BuildSystem,
  assetJSON: UploadDirType,
  resourceJSON: UploadDirType,
  targetDir: string,
) {
  const assetHash = await buildSystem.storeJSON(assetJSON);
  let error: any = null;
  await Promise.all(
    Object.keys(resourceJSON).map(async (resourceName) => {
      const resourceHash = resourceJSON[resourceName];
      if (typeof resourceHash === 'string') {
        const bs = new BuildSystem(
          buildSystem.cache,
          buildSystem.contentServer,
          buildSystem.ossContentServer,
          buildSystem.nextUidListUsingGet,
          buildSystem.logger.child({ caller: resourceName }),
          buildSystem.debug,
        );
        try {
          let valueExpr: string = `{};`;
          let typeExpr: string = 'any';
          let env = '';
          try {
            const hash = await bs.build(
              'buildResource',
              assetHash,
              resourceHash,
            );
            const resourceSpec = await bs.retrieveJSON(resourceHash);
            if ('env' in resourceSpec) {
              env = resourceSpec.env;
            }
            if (resourceSpec.ret === 'bin') {
              const bytes = await bs.retrieveContent(hash);
              if (!bytes) {
                throw new Error('error loading resoult hash: ' + hash);
              }
              valueExpr = `new Uint8Array([${Array.prototype.join.call(
                bytes,
              )}]);`;
              typeExpr = 'Uint8Array';
            } else if (resourceSpec.ret === 'text') {
              const text = decodeUTF8(await bs.retrieveContent(hash));
              typeExpr = 'string';
              valueExpr = emitStringLiteral(text);
            } else if (resourceSpec.ret === 'json') {
              const str = decodeUTF8(await bs.retrieveContent(hash));
              if (str) {
                const json = JSON.parse(str);
                if (resourceSpec.type) {
                  typeExpr = resourceSpec.type;
                } else {
                  typeExpr = inferType(json);
                }
                valueExpr = `<any>JSON.parse(${emitStringLiteral(str)})`;
              } else {
                typeExpr = 'undefined';
                valueExpr = 'void 0';
              }
            } else {
              typeExpr = 'string';
              valueExpr = emitStringLiteral(hash);
            }
          } catch (e) {
            bs.logger.error(
              `error building resource ${resourceName}:  ${e.stack}`,
            );
            valueExpr += `/* error building ${resourceName}: ${escape(
              e.message,
            )} */`;
            error = new Error(
              `Build resource error: ${bs.logger.bindings().caller} ${
                e.message || ''
              } ${e.stack || ''}`,
            );
          }
          bs.logger.info('test ' + resourceName);
          const baseName = path.basename(resourceName).replace('.json', '');
          const typeName = baseName.toUpperCase() + '_RES';
          const src = `export const ${typeName}:${typeExpr} = ${valueExpr};`;
          const filePath = path.join(targetDir, env, baseName + '.ts');
          try {
            if (env) {
              await fsext.mkdirp(path.join(targetDir, env));
            }
            const prevSrc = await fs.promises.readFile(filePath);
            if (prevSrc.toString() === src) {
              return;
            }
          } catch (e) {}
          await fs.promises.writeFile(filePath, src);
          bs.logger.info(`${filePath} updated`);
        } catch (e) {
          bs.logger.error(e);
          error = new Error(
            `Build resource error: ${bs.logger.bindings().caller} ${
              e.message || ''
            } ${e.stack || ''}`,
          );
        }
      }
    }),
  );
  if (error) {
    throw error;
  }
}

export async function buildResources(
  buildSystem: BuildSystem,
  contentServer: ContentServer,
  logger: Logger,
  paths: {
    tasksDir: string;
    assetsDir: string;
    targetDir: string;
  },
  skipPattern?: RegExp,
) {
  const { tasksDir, assetsDir, targetDir } = paths;
  const beginTime = Date.now();
  logger.info('building resources...');
  const [assetJSON, resourceJSON] = await Promise.all([
    uploadDirectory(assetsDir, contentServer),
    uploadDirectory(tasksDir, contentServer),
  ]);

  const pending: Promise<void>[] = [];
  if (skipPattern) {
    Object.keys(resourceJSON).forEach((resource) => {
      if (resource.match(skipPattern)) {
        delete resourceJSON[resource];
        pending.push(
          (async () => {
            const baseName = path.basename(resource).replace('.json', '');
            const typeName = baseName.toUpperCase() + '_RES';
            const src = `export const ${typeName}:any = void 0;`;
            await fs.promises.writeFile(
              path.join(targetDir, baseName + '.ts'),
              src,
            );
            buildSystem.logger.info('write temporary file ' + baseName + '.ts');
          })(),
        );
      }
    });
  }

  await rebuildResources(buildSystem, assetJSON, resourceJSON, targetDir);
  await Promise.all(pending);
  logger.info(
    `resource build total time = ${((Date.now() - beginTime) / 1000).toFixed(
      4,
    )} seconds`,
  );
}
