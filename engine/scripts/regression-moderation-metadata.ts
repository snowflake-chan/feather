import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ModerationMetadataReporter } from '../src/moderation/moderation-metadata';
async function main() {
  const dir = mkdtempSync(join(tmpdir(), 'box-metadata-regression-'));
  try {
    const credential = join(dir, 'credential'); writeFileSync(credential, 'fixture-map-credential');
    process.env.BOX_MODERATION_CREDENTIAL_PATH = credential;
    process.env.BOX_PLAYER_SERVICE_INTERNAL_URL = 'http://fixture.test';
    process.env.BOX_WORLD_PERMANENT_MAP_ID = 'fixture-map';
    process.env.SERVER_ID = 'fixture-map';
    process.env.MODE = 'play';
    delete process.env.BOX_SERVER_NAME;
    let name = 'Original';
    const calls: any[] = []; let failing = false;
    globalThis.fetch = async input => {
      const req = input as Request;
      assert.equal(req.headers.get('Authorization'), 'Moderation fixture-map-credential');
      calls.push(await req.json());
      return new Response(JSON.stringify(failing ? { message: 'retry' } : { ok: true }), { status: failing ? 503 : 200 });
    };
    const reporter = new ModerationMetadataReporter(() => ({ name }));
    await reporter.refresh(); await reporter.refresh(); assert.equal(calls.length, 1);
    name = 'Changed'; failing = true; await reporter.refresh(); assert.equal(calls.length, 2);
    failing = false; await reporter.refresh(); assert.equal(calls.length, 3);
    await reporter.refresh(); assert.equal(calls.length, 3);
    assert.equal(calls[2].name, 'Changed');
    console.log('metadata regression passed: initial upload, unchanged suppression, changed upload and failure retry');
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
