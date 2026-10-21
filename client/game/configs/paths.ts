import path from 'path';

export const ROOT = process.cwd();
export const TEMP = path.join(ROOT, '.temp');

// output from resource files goes here
export const RES_SRC = path.join(ROOT, 'src', 'resource');
export const RES_PATH = path.join(ROOT, 'resource');
export const ASSETS_IPFS = path.join(ROOT, 'assets', 'ipfs');
