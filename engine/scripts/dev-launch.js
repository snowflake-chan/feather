'use strict'

const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

const packageRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(packageRoot, '../..')
const localEngineRoot = path.join(repoRoot, 'apps/local-engine')
const dataRoot = path.resolve(
  process.env.STORAGE_PATH || path.join(localEngineRoot, 'data'),
)
const statePath = path.resolve(
  process.env.BOX_PROJECT_STATE_PATH ||
    path.join(dataRoot, 'project-state.json'),
)
const mode = process.env.MODE === 'edit' ? 'edit' : 'play'

let permissionHash = process.env.HASH || ''
if (!permissionHash && fs.existsSync(statePath)) {
  try {
    const state = JSON.parse(fs.readFileSync(statePath, 'utf8'))
    if (typeof state.permissionHash === 'string') {
      permissionHash = state.permissionHash
    }
  } catch (error) {
    console.error(`无法读取本地工程状态：${error.message}`)
    process.exit(1)
  }
}

const inspectArgs =
  process.env.BOX_DISABLE_INSPECT === 'true'
    ? []
    : [`--inspect=127.0.0.1:${process.env.BOX_INSPECT_PORT || '9223'}`]
const child = spawn(
  process.execPath,
  [
    ...inspectArgs,
    '-r',
    '@swc-node/register',
    '--max-old-space-size=4096',
    'src/launch.ts',
  ],
  {
    cwd: packageRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV || 'development',
      NEXT_PUBLIC_APP_ENV:
        process.env.NEXT_PUBLIC_APP_ENV || 'development',
      NEXT_PUBLIC_APP_EDITION:
        process.env.NEXT_PUBLIC_APP_EDITION || 'createra',
      NEXT_PUBLIC_APP_REGION:
        process.env.NEXT_PUBLIC_APP_REGION || 'cn',
      BOX_LOCAL_CONFIG_PATH:
        process.env.BOX_LOCAL_CONFIG_PATH ||
        path.join(localEngineRoot, 'config/local.config.json'),
      BOX_LOCAL_ENGINE_ROOT: localEngineRoot,
      METHOD: 'local',
      MODE: mode,
      LOGIN:
        process.env.LOGIN || (mode === 'edit' ? 'admin' : 'guest'),
      IS_HTTPS: process.env.IS_HTTPS || 'false',
      HOST_IP: process.env.HOST_IP || '127.0.0.1',
      PORT:
        process.env.PORT || (mode === 'edit' ? '9967' : '9966'),
      STORAGE_PATH: dataRoot,
      BOX_PROJECT_STATE_PATH: statePath,
      HASH: permissionHash,
      VM: process.env.VM || 'local',
      MAX_ZERO_PLAYER_TIME:
        process.env.MAX_ZERO_PLAYER_TIME || '2147483647',
    },
  },
)

child.on('error', (error) => {
  console.error(`无法启动本地游戏运行时：${error.message}`)
  process.exitCode = 1
})
child.on('exit', (code, signal) => {
  process.exitCode = signal ? 1 : code || 0
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => child.kill(signal))
}
