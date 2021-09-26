/**
 * Handles dealing with errors for super-gross mode. Creates a context, in which
 * any synchronously thrown errors will be passed to `captureError`. Which
 * will record the error such that it will be rethrown after the call back is complete.
 * Remove in v8
 */
export function errorContext(cb) {
  cb();
}

// captures errors only in super-gross mode.
export function captureError(err) {
  // do nothing
}
