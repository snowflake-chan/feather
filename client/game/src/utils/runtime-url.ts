/** Resolve an endpoint against the runtime selected for the current map. */
export function resolveRuntimeURL(runtimeURL: string, endpoint: string) {
  return `${runtimeURL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
}
