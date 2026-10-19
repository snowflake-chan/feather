import assert from 'node:assert/strict';
import { DataType, newDb } from 'pg-mem';

import { Logger } from '@box/utils/logger';
import { PostgresDataStorage } from '../src/storage/postgres-data-storage';

function hashText(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return hash;
}

async function main() {
  const memory = newDb({ noAstCoverageCheck: true });
  memory.public.registerFunction({
    name: 'hashtext',
    args: [DataType.text],
    returns: DataType.integer,
    implementation: hashText,
  });
  memory.public.registerFunction({
    name: 'pg_advisory_xact_lock',
    args: [DataType.integer, DataType.integer],
    returns: DataType.integer,
    implementation: () => 1,
  });
  memory.public.registerFunction({
    name: 'to_jsonb',
    args: [DataType.float],
    returns: DataType.jsonb,
    implementation: (value) => value,
  });
  memory.public.registerFunction({
    name: 'jsonb_typeof',
    args: [DataType.jsonb],
    returns: DataType.text,
    implementation: (value) => {
      if (value === null) return 'null';
      if (Array.isArray(value)) return 'array';
      if (typeof value === 'object') return 'object';
      return typeof value;
    },
  });
  for (let depth = 1; depth <= 5; depth += 1) {
    memory.public.registerFunction({
      name: 'jsonb_extract_path',
      args: [DataType.jsonb, ...Array(depth).fill(DataType.text)],
      returns: DataType.jsonb,
      implementation: (value, ...path) => path.reduce(
        (current, segment) => current?.[segment],
        value,
      ),
    });
  }
  const adapter = memory.adapters.createPg();
  const pool = new adapter.Pool() as any;
  const originalQuery = pool.query.bind(pool);
  let queryCount = 0;
  pool.query = (...args: any[]) => {
    queryCount += 1;
    return originalQuery(...args);
  };
  const logger = new Logger(() => undefined, ['postgres-test'], 'test');
  const createStorage = (
    projectNamespace: string,
    groupNamespace = '100010141',
    mode = 'play',
  ) => new PostgresDataStorage({
    connectionString: 'postgresql://unused/box_test',
    schema: 'box_engine',
    poolSize: 4,
    ssl: false,
    sslRejectUnauthorized: true,
    projectNamespace,
    groupNamespace,
    mode,
    lockTimeoutMs: 5_000,
    logger,
    pool,
  });

  const first = createStorage('world-a');
  const second = createStorage('world-b');
  const permanentIdStorage = createStorage('11111111111111111111');
  const editPermanentIdStorage = createStorage(
    '22222222222222222222',
    '33333333333333333333',
    'edit',
  );
  const longStorageName = 'player_profile_archive';
  const longProjectTableName = (editPermanentIdStorage as any).tableBaseName(
    'project',
    longStorageName,
  );
  const longGroupTableName = (editPermanentIdStorage as any).tableBaseName(
    'group',
    longStorageName,
  );
  assert.match(
    longProjectTableName,
    /^edit_22222222222222222222_/,
    'project storage names must expose the mode and permanent map ID',
  );
  assert.match(
    longGroupTableName,
    /^group_edit_33333333333333333333_/,
    'group storage names must expose the mode and permanent map group ID',
  );
  assert.ok(
    Buffer.byteLength(`${longProjectTableName}_keys`, 'utf8') <= 63,
    'project storage tables must fit the PostgreSQL identifier limit',
  );
  assert.ok(
    Buffer.byteLength(`${longGroupTableName}_keys`, 'utf8') <= 63,
    'group storage tables must fit the PostgreSQL identifier limit',
  );
  assert.equal(
    longProjectTableName.startsWith('storage_'),
    false,
    'project storage must never fall back to an opaque storage_<hash> table',
  );
  assert.equal(
    longGroupTableName.startsWith('storage_'),
    false,
    'group storage must never fall back to an opaque storage_<hash> table',
  );
  assert.equal(
    queryCount,
    0,
    'constructing a runtime storage adapter must not connect to PostgreSQL',
  );
  await Promise.all([first.connect(), second.connect()]);
  assert.ok(queryCount > 0, 'the first storage connection should initialize PostgreSQL');
  const tablesBeforeFirstStorageAccess = await pool.query(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'box_engine'`,
  );
  assert.deepEqual(
    tablesBeforeFirstStorageAccess.rows,
    [],
    'connecting a runtime must not create empty data-storage tables',
  );

  await first.set('project', 'players', 'alice', { coins: 10, level: 2 });
  await pool.query(
    `SELECT 1 FROM "box_engine"."play_world-a_players" LIMIT 1`,
  );
  await pool.query(
    `SELECT 1 FROM "box_engine"."play_world-a_players_keys" LIMIT 1`,
  );
  await assert.rejects(
    pool.query(`SELECT 1 FROM "box_engine"."data_entries" LIMIT 1`),
    /data_entries/i,
  );
  assert.deepEqual((await first.get('project', 'players', 'alice'))?.value, {
    coins: 10,
    level: 2,
  });
  assert.equal(await second.get('project', 'players', 'alice'), undefined);

  const longestValidStorageName = 'a'.repeat(50);
  await permanentIdStorage.set('project', longestValidStorageName, 'map-player', 1);
  assert.equal(
    (await permanentIdStorage.get('project', longestValidStorageName, 'map-player'))?.value,
    1,
    'permanent map IDs must support the full 50-character storage-space name',
  );

  await editPermanentIdStorage.set('project', 'player', 'editor', { coins: 1 });
  await editPermanentIdStorage.set('group', 'player', 'editor', { season: 2 });
  await pool.query(
    `SELECT 1 FROM "box_engine"."edit_22222222222222222222_player" LIMIT 1`,
  );
  await pool.query(
    `SELECT 1 FROM "box_engine"."group_edit_33333333333333333333_player" LIMIT 1`,
  );

  const locked = await first.get('project', 'players', 'alice', undefined, 'ticket-1');
  await first.set('project', 'players', 'alice', {
    ...(locked?.value as Record<string, unknown>),
    coins: 15,
  }, 'ticket-1');
  const updatedPlayer = (await first.get('project', 'players', 'alice'))?.value as
    | { coins: number }
    | undefined;
  assert.equal(updatedPlayer?.coins, 15);

  assert.equal(await first.increment('project', 'scores', 'alice', 2), 2);
  assert.equal(await first.increment('project', 'scores', 'alice', 3), 5);
  await first.set('project', 'ranking', 'alice', { score: 30 });
  await first.set('project', 'ranking', 'bob', { score: 10 });
  const ranking = await first.list('project', 'ranking', {
    cursor: 0,
    pageSize: 1,
    ascending: false,
    constraintTarget: 'score',
  });
  assert.equal(ranking.items[0]?.key, 'alice');
  assert.equal(ranking.isLastPage, false);

  const removed = await first.remove('project', 'players', 'alice', 'ticket-2');
  const removedPlayer = removed?.value as { coins: number } | undefined;
  assert.equal(removedPlayer?.coins, 15);
  assert.equal(await first.get('project', 'players', 'alice'), undefined);
  const playerHistory = await pool.query(
    `SELECT COUNT(*)::int AS count FROM "box_engine"."play_world-a_players"`,
  );
  const playerKeys = await pool.query(
    `SELECT "isDelete", "record"
     FROM "box_engine"."play_world-a_players_keys"
     WHERE "key" = 'alice'`,
  );
  assert.equal(Number(playerHistory.rows[0]?.count), 2);
  assert.equal(playerKeys.rows[0]?.isDelete, true);
  assert.ok(playerKeys.rows[0]?.record, 'soft-deleted key must retain its record link');

  await first.set('group', 'global', 'season', 7);
  assert.equal((await second.get('group', 'global', 'season'))?.value, 7);

  // Simulate tables copied directly from the original boxes database. The
  // adapter must follow _keys.record and unwrap value.content without a data
  // conversion step.
  await first.createTable('group', 'legacy');
  await pool.query(
    `INSERT INTO "box_engine"."group_play_100010141_legacy"
      ("objectId", "createdAt", "updatedAt", "metadata", "value", "key", "version")
     VALUES
      ('legacy-record', NOW(), NOW(), '{}', $1, 'old-player', 'legacy-version')`,
    [JSON.stringify({ content: { career: 'Soldier', level: 12 } })],
  );
  await pool.query(
    `INSERT INTO "box_engine"."group_play_100010141_legacy_keys"
      ("objectId", "createdAt", "updatedAt", "key", "isDelete", "record")
     VALUES
      ('legacy-key', NOW(), NOW(), 'old-player', FALSE, 'legacy-record')`,
  );
  assert.deepEqual(
    (await first.get('group', 'legacy', 'old-player'))?.value,
    { career: 'Soldier', level: 12 },
  );

  await pool.end();
  process.stdout.write('PostgreSQL data storage checks passed\n');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
