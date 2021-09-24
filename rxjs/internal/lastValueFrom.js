// Converts an observable to a promise by subscribing to the observable,
// waiting for it to complete, and resolving the returned promise with the
// last value from the observed stream.
//
// If the observable stream completes before any values were emitted, the
// returned promise will reject with `EmptyError` or will resolve

import { EmptyError } from "..";

// with the default value if a default was specified.
export function lastValueFrom(source, config) {
  const hasConfig = typeof config === "object";
  return new Promise((resolve, reject) => {
    let _hasValue = false;
    let _value;
    source.subscribe({
      next: (value) => {
        _value = value;
        _hasValue = true;
      },
      error: reject,
      complete: () => {
        if (_hasValue) {
          resolve(_value);
        } else if (hasConfig) {
          resolve(config && config.defaultValue);
        } else {
          reject(new EmptyError());
        }
      }
    });
  });
}
