import { MuFloat64, MuStruct, MuVarint } from '@box/mudb/schema';
import { ScriptPerfCounterSchema } from '../script/script-protocol';

export const ServerPerfSchema = new MuStruct({
  // number of lines logged
  scriptLogLines: new MuVarint(),
  scriptErrors: new MuVarint(),

  // sql stats
  sqlQueries: new MuVarint(),
  sqlRows: new MuVarint(),
  sqlErrors: new MuVarint(),

  // ipfs stats
  ipfsWriteBytes: new MuVarint(),
  ipfsReadBytes: new MuVarint(),
  ipfsMiss: new MuVarint(),

  // mudb bandwidth
  socketClosed: new MuVarint(),

  // ping stats
  minPing: new MuFloat64(),
  avgPing: new MuFloat64(),
  maxPing: new MuFloat64(),
  pingCount: new MuFloat64(),

  // tick time
  minTickTime: new MuFloat64(),
  maxTickTime: new MuFloat64(),
  avgTickTime: new MuFloat64(),
  tickCounter: new MuFloat64(),

  // script counters
  scriptDisconnects: new MuVarint(),
  scriptConnects: new MuVarint(),
  script: ScriptPerfCounterSchema,
});
