export class CliError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly exitCode: 1 | 2 = 1,
    public readonly hint?: string,
  ) {
    super(message);
  }
}

export function usage(message: string, hint?: string): never {
  throw new CliError('USAGE', message, 2, hint);
}

export function runtime(message: string, code = 'RUNTIME_ERROR'): never {
  throw new CliError(code, message, 1);
}
