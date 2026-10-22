export interface UnpackOptions {
  archive?: string;
  dir?: string;
  kind?: string;
  force?: boolean;
}

export async function unpackCommand(_options: UnpackOptions) {
  const error = new Error(
    'unpack is not implemented yet; use feather build for now',
  ) as Error & { code?: string };
  error.code = 'NOT_IMPLEMENTED';
  throw error;
}
