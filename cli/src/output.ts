export function writeJson(command: string, data: unknown) {
  process.stdout.write(`${JSON.stringify({ ok: true, command, data })}\n`);
}

export function writeError(command: string, code: string, message: string, json: boolean) {
  if (json) {
    process.stderr.write(`${JSON.stringify({ ok: false, command, error: { code, message } })}\n`);
  } else {
    process.stderr.write(`${code}: ${message}\n`);
  }
}
