import type { ModerationError } from '@box/schema/api/js/moderation'
import { normalizeModerationError } from '@box/schema/api/js/moderation-error'

/** Errors must retain their native prototype when crossing isolated-vm. */
export function scriptModerationError(error: unknown, code = 503, fallback?: string): Error & ModerationError {
  const details = normalizeModerationError(error, code, fallback)
  // Enumerable CommonError fields keep catch/JSON.stringify compatible; the
  // native message preserves all three fields when an error is left uncaught.
  return Object.assign(new Error(JSON.stringify(details)), details)
}
