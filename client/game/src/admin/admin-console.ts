import { AssetType } from '@box/schema/project/project-rda';
import type { EditClient } from 'src/client/edit/edit-client';
import type { PlayClient } from 'src/client/play/play-client';
import type {
  EngineModelProfileData,
  EngineProfileData,
} from 'src/engine/profile/profiler';
import { Pane } from 'tweakpane';

type HashToName = Record<string, string>;

export class AdminConsole {
  private view: Pane | undefined;
  private formattedMapProfile: EngineProfileData | undefined;
  private hashToName: HashToName = {};
  private audioHashToName: HashToName = {};
  public get viewTotalOpaqueFaces() {
    return (
      this.app.game.profiler.viewOpaqueProfile?.summary.totalFaceCount || 0
    );
  }

  public get viewTotalTransparentFaces() {
    return (
      this.app.game.profiler.viewTransparentProfile?.summary.totalFaceCount || 0
    );
  }

  public get viewOpaqueModels() {
    if (!this.app.game.profiler.viewOpaqueProfile) {
      return '';
    }

    return this.formatModelsToPane(
      this.app.game.profiler.viewOpaqueProfile.models,
    );
  }

  public get viewTransparentModels() {
    if (!this.app.game.profiler.viewTransparentProfile) {
      return '';
    }

    return this.formatModelsToPane(
      this.app.game.profiler.viewTransparentProfile.models,
    );
  }

  public get mapTotalOpaqueFaces() {
    return this.formattedMapProfile?.opaque.summary.totalFaceCount || 0;
  }

  public get mapTotalTransparentFaces() {
    return this.formattedMapProfile?.transparent.summary.totalFaceCount || 0;
  }

  public get mapOpaqueModels() {
    if (!this.formattedMapProfile) {
      return '';
    }
    return this.formatModelsToPane(this.formattedMapProfile.opaque.models);
  }

  public get mapTransparentModels() {
    if (!this.formattedMapProfile) {
      return '';
    }
    return this.formatModelsToPane(this.formattedMapProfile.transparent.models);
  }

  public get profilingEnabled() {
    return this.app.game.profiler.viewProfilingEnabled;
  }

  public set profilingEnabled(val: boolean) {
    this.app.game.profiler.viewProfilingEnabled = val;

    if (!this.formattedMapProfile || val) {
      this.updateMapProfile();
      this.view?.refresh();
    }
  }

  public get audioProfilingEnabled() {
    return this.app.game.profiler.viewAudioProfilingEnabled;
  }
  public set audioProfilingEnabled(val: boolean) {
    this.app.game.profiler.viewAudioProfilingEnabled = val;

    // TODO maybe DI container?
    if (val && (this.app as EditClient).state.replica) {
      this.updateHashToName(
        this.audioHashToName,
        (this.app as EditClient).state.replica.project.audioAssets,
        (asset) => asset.type === AssetType.AUDIO,
      );

      this.view?.refresh();
    }
  }

  public get activeSoundEffectsCount() {
    return this.app.game.profiler.viewActiveSoundEffects?.length || 0;
  }

  public get activeSoundEffects() {
    if (!this.app.game.profiler.viewActiveSoundEffects) {
      return '';
    }

    return this.app.game.profiler.viewActiveSoundEffects
      .map(({ hash }) => this.audioHashToName[hash] || hash)
      .join('\n');
  }

  public get showFps() {
    return this.app.game.showFps;
  }
  public set showFps(val) {
    this.app.game.showFps = val;
  }

  constructor(private app: PlayClient | EditClient) {}

  public getMapProfile() {
    if (!this.formattedMapProfile) {
      this.updateMapProfile();
    }
    return this.formattedMapProfile;
  }

  public getViewProfile() {
    const profile = this.app.game.profiler.profileView();
    this.formatProfileData(profile);
    return profile;
  }

  public initAdminPanel(container?: HTMLElement) {
    if (process.env.RUSTY) {
      return;
    }

    if (this.view) {
      console.warn('Admin panel already initialized.');
      return;
    }

    const pane = new Pane({
      container,
    });

    pane.element.style.position = 'fixed';
    pane.element.style.top = '0';
    pane.element.style.right = '0';

    const root = pane.addFolder({
      title: '管理员面板',
      expanded: false,
    });

    root.addBinding(this, 'showFps', {
      label: '开启FPS',
    });

    root.addBinding(this, 'profilingEnabled', {
      label: '开启数据收集',
    });

    const tab = root.addTab({
      pages: [{ title: '概览' }, { title: '模型列表' }],
    });

    const viewFolder = tab.pages[0].addFolder({
      title: '当前画面',
    });
    viewFolder.addBinding(this, 'viewTotalOpaqueFaces', {
      label: '不透明面数',
      readonly: true,
      interval: 200,
    });
    viewFolder.addBinding(this, 'viewTotalTransparentFaces', {
      label: '透明面数',
      readonly: true,
      interval: 200,
    });

    const mapFolder = tab.pages[0].addFolder({
      title: '全地图（每次开启数据收集时更新）',
    });
    mapFolder.addBinding(this, 'mapTotalOpaqueFaces', {
      label: '不透明面数',
      readonly: true,
    });
    mapFolder.addBinding(this, 'mapTotalTransparentFaces', {
      label: '透明面数',
      readonly: true,
    });

    const mapModelsTab = tab.pages[1].addTab({
      pages: [{ title: '画面' }, { title: '全图' }],
    });
    mapModelsTab.pages[1].addBinding(this, 'mapOpaqueModels', {
      label: '不透明实体',
      readonly: true,
      multiline: true,
      rows: 5,
    });
    mapModelsTab.pages[1].addBinding(this, 'mapTransparentModels', {
      label: '透明实体',
      readonly: true,
      multiline: true,
      rows: 5,
    });

    mapModelsTab.pages[0].addBinding(this, 'viewOpaqueModels', {
      label: '不透明实体',
      readonly: true,
      multiline: true,
      rows: 5,
      interval: 200,
    });
    mapModelsTab.pages[0].addBinding(this, 'viewTransparentModels', {
      label: '透明实体',
      readonly: true,
      multiline: true,
      rows: 5,
      interval: 200,
    });

    mapModelsTab.pages[0]
      .addButton({
        title: '打印数据到控制台',
      })
      .on('click', () => {
        console.info(this.formattedMapProfile);
      });

    mapModelsTab.pages[1]
      .addButton({
        title: '打印数据到控制台',
      })
      .on('click', () => {
        console.info('Opaque models:');
        console.info(this.viewOpaqueModels);
        console.info('Transparent models:');
        console.info(this.viewTransparentModels);
      });

    root.addBinding(this, 'audioProfilingEnabled', {
      label: '开启音频数据收集',
    });
    const audioTab = root.addTab({
      pages: [{ title: '音频' }],
    });
    audioTab.pages[0].addBinding(this, 'activeSoundEffectsCount', {
      label: '激活的音效数量',
      readonly: true,
    });
    audioTab.pages[0].addBinding(this, 'activeSoundEffects', {
      label: '激活的音效',
      readonly: true,
      multiline: true,
      rows: 5,
      interval: 200,
    });

    root
      .addButton({
        title: '关闭面板',
      })
      .on('click', () => {
        this.closeAdminPanel();
      });

    this.view = pane;
  }

  public closeAdminPanel() {
    if (!this.view) {
      return;
    }
    this.profilingEnabled = false;
    this.view.dispose();
    this.view = undefined;
  }

  private formatModelsToPane(models: EngineModelProfileData[]) {
    return models
      .sort((a, b) => {
        return b.faceCount - a.faceCount;
      })
      .map(
        (model) =>
          `${model.faceCount}: ${this.hashToName[model.id] || model.id}`,
      )
      .join('\n');
  }

  private formatProfileData(out: EngineProfileData) {
    for (let i = 0; i < out.opaque.models.length; ++i) {
      out.opaque.models[i].id =
        this.hashToName[out.opaque.models[i].id] || out.opaque.models[i].id;
    }

    for (let i = 0; i < out.transparent.models.length; ++i) {
      out.transparent.models[i].id =
        this.hashToName[out.transparent.models[i].id] ||
        out.transparent.models[i].id;
    }
  }

  private updateMapProfile() {
    if ((this.app as EditClient).state.replica) {
      this.updateHashToName(
        this.hashToName,
        (this.app as EditClient).state.replica.extraProjectInfo.meshAssets,
      );
    }
    const profile = this.app.game.profiler.profileMap();
    this.formatProfileData(profile);
    this.formattedMapProfile = profile;
  }

  private updateHashToName<T extends { hash: string }>(
    out: HashToName,
    assets: Record<string, T>,
    filter: (asset: T) => boolean = () => true,
  ) {
    if (!(this.app as EditClient).state.replica) {
      return;
    }

    Object.keys(assets).forEach((name) => {
      const asset = assets[name];

      if (!filter(asset)) {
        return;
      }

      const { hash } = assets[name];

      out[hash] = name;
    });
  }
}
