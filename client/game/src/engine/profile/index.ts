import { GameClient } from '../game-client';
import { PieChart } from './pie-chart';

const URL_API =
  typeof window === 'undefined'
    ? null
    : (<any>window).URL || (<any>window).webkitURL || null;

interface ProfileData {
  record: {
    [cmd: string]: { count: number; cpuTime: number; gpuTime: number };
  };
  timeStamp: number;
  modelVertexCount: number;
  voxelVertexCount: number;
  modelsNumber: number;
}

const MAX_RECORD_LENGTH = 1000;

export class ProfileTool {
  private game: GameClient;
  private profiles: any[];
  private _currentRecord: ProfileData | null = null;
  private _lastRecord: { GPU: number; CPU: number } = { GPU: 0, CPU: 0 };
  private flagMemory: boolean = false;
  private flagConnection: boolean = false;
  private netInfo: { effectiveType: string; downlink: number; rtt: number };
  public lastTime: number = 0;

  private shaderCmdStats: { [key: string]: { gpuTime: number } } = {};
  private previousCmdTime: { [key: string]: { gpuTime: number } } = {};

  private chartCanvas?: HTMLCanvasElement;

  constructor(spec: { game: GameClient }) {
    this.game = spec.game;
    this.profiles = [];
    // this.game.state.perf= this.doProfile.bind(this);
    this.flagMemory = window.performance && (window.performance as any).memory;
    this.flagConnection = (window.navigator as any).connection;
    this.netInfo = { effectiveType: '', downlink: 0, rtt: 0 };
    if (this.flagConnection) {
      (window.navigator as any).connection.onChange =
        this.updateNetInfo.bind(this);
      this.updateNetInfo();
    }
  }

  private updateNetInfo() {
    const { effectiveType, downlink, rtt } = (window.navigator as any)
      .connection;
    this.netInfo = { effectiveType, downlink, rtt };
    console.table(this.netInfo);
  }
  private doProfile() {
    const { reglLoader } = this.game.state.gl;
    if (reglLoader) {
      const gpuStats = reglLoader.stats();
      const modelVertexCount = 0;
      const voxelVertexCount = 0;
      const modelsNumber = 0;
      /*
            for (let i = 0; i < glstate.models.models.length; i++) {
                modelVertexCount += glstate.models.models[i].vertexCount;
            }
            for (let i = 0; i < glstate.voxels.chunks.length; i++) {
                const lodLen = glstate.voxels.chunks[i].geom.vertexCount.length;
                voxelVertexCount += glstate.voxels.chunks[i].geom.vertexCount[lodLen - 1] +
                                    glstate.voxels.chunks[i].alphaGeom.vertexCount[lodLen - 1] +
                                    glstate.voxels.chunks[i].fluidGeom.vertexCount;
            }
            modelsNumber = glstate.models.models.length;
            */
      this._currentRecord = {
        timeStamp: Date.now(),
        record: gpuStats,
        modelVertexCount,
        voxelVertexCount,
        modelsNumber,
      };
      this.stateProfile();
    }
  }

  private stateProfile() {
    let CPU = 0;
    let memory = 0;
    let shaderCount = 0;
    if (this.flagMemory) {
      memory = (window.performance as any).memory.usedJSHeapSize;
    }
    let totalGPUTime = 0;
    if (this._currentRecord) {
      const { record } = this._currentRecord;
      for (const cmd in record) {
        if (this.shaderCmdStats[cmd] === undefined) {
          this.shaderCmdStats[cmd] = {
            gpuTime: 0,
          };
          this.previousCmdTime[cmd] = {
            gpuTime: record[cmd].gpuTime,
          };
        } else {
          this.shaderCmdStats[cmd].gpuTime =
            record[cmd].gpuTime - this.previousCmdTime[cmd].gpuTime;
          this.previousCmdTime[cmd].gpuTime = record[cmd].gpuTime;
        }
        const { cpuTime, gpuTime } = record[cmd];
        CPU += cpuTime;
        totalGPUTime += this.shaderCmdStats[cmd].gpuTime;
        if (cpuTime || gpuTime) {
          shaderCount++;
        }
      }
      const tempCPU = CPU;
      CPU = Math.round(CPU - this._lastRecord.CPU);
      this._lastRecord.CPU = tempCPU;
    }
    const now = Date.now();
    const frameTime = now - this.lastTime;
    this.lastTime = now;
    const playersCount = this.game.state.players.length;
    const objectsCount = this.game.state.bodies.length;
    const gpuTimeEachCmd = this._sortTable(this.shaderCmdStats, 'gpuTime');
    let totalBufferSize = 0;
    let totalTextureSize = 0;
    if (
      this.game.state.gl.regl &&
      this.game.state.gl.regl.stats !== undefined &&
      this.game.state.gl.regl.stats.getTotalBufferSize !== undefined
    ) {
      totalBufferSize = this.game.state.gl.regl.stats.getTotalBufferSize();
    }
    if (
      this.game.state.gl.regl &&
      this.game.state.gl.regl.stats !== undefined &&
      this.game.state.gl.regl.stats.getTotalTextureSize !== undefined
    ) {
      totalTextureSize = this.game.state.gl.regl.stats.getTotalTextureSize();
    }
    const ret = {
      CPU,
      totalGPUTime,
      cmdsGPUTime: gpuTimeEachCmd,
      totalBufferSize: totalBufferSize,
      totalTextureSize: totalTextureSize,
      memory: memory,
      frameTime: frameTime,
      playersCount: playersCount,
      objectsCount: objectsCount,
      shaderCount: shaderCount,
      modelVertexCount: this._currentRecord
        ? this._currentRecord.modelVertexCount
        : 0,
      voxelVertexCount: this._currentRecord
        ? this._currentRecord.voxelVertexCount
        : 0,
      modelsNumber: this._currentRecord ? this._currentRecord.modelsNumber : 0,
    };
    if (this.profiles.length > MAX_RECORD_LENGTH) {
      this.profiles.shift();
    }
    this.profiles.push(ret);
    return ret;
  }

  private _sortTable(
    table: { [key: string]: { [filed: string]: number } },
    field: string,
  ) {
    const keys = Object.keys(table);
    keys.sort((a, b) => {
      return table[b][field] - table[a][field];
    });
    const rst: any[] = [];
    for (let i = 0; i < keys.length; i++) {
      const cmdName = keys[i];
      rst.push({
        [cmdName]: table[keys[i]][field] as number,
      });
    }
    return rst;
  }

  public saveAsFile() {
    if (URL_API) {
      const filename = `profile_${Date.now()}.json`;
      const content = JSON.stringify(this.profiles);
      const eleLink = document.createElement('a');
      eleLink.download = filename;
      eleLink.style.display = 'none'; // 字符内容转变成blob地址
      const blob = new Blob([content]);
      eleLink.href = URL_API.createObjectURL(blob); // 触发点击
      document.body.appendChild(eleLink);
      eleLink.click(); // 然后移除
      document.body.removeChild(eleLink);
    }
  }

  public generatePieChart() {
    if (!this.chartCanvas) {
      this.chartCanvas = document.createElement('canvas');
      this.chartCanvas.width = 500;
      this.chartCanvas.height = 450;
    }
    const profileLen = this.profiles.length;
    const cmdsGPUTime = this.profiles[profileLen - 1].cmdsGPUTime;
    const gpuTimeTable: { [key: string]: number } = {};
    for (let i = 0; i < cmdsGPUTime.length; i++) {
      const cmdName = Object.keys(cmdsGPUTime[i])[0];
      gpuTimeTable[cmdName] = cmdsGPUTime[i][cmdName];
    }
    const gpuPieChart = new PieChart({
      canvas: this.chartCanvas,
      data: gpuTimeTable,
      doughnutHoleSize: 0.5,
      center: [150, 150],
      radius: 150,
    });

    gpuPieChart.clear();
    gpuPieChart.draw();
    gpuPieChart.drawTag();
    gpuPieChart.toPicture();
  }
}
