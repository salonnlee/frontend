import { EmptyError } from "..";
import { SafeSubscriber } from "./Subscriber";

// converts an observable to a promise by subscribing to the observable,
// and returning a promise that will resolve as soon as the first value
// arrives from the observable. The subscription will then be closed.
//
// If the observable stream completes before any values were emitted, the
// returned promise will reject with `EmptyError` or will resolve
// with the default value if a default was specified.
export function firstValueFrom(source, config) {
  const hasConfig = typeof config === "object";
  return new Promise((resolve, reject) => {
    const subscriber = new SafeSubscriber({
      next: (value) => {
        resolve(value);
        subscriber.unsubscribe();
      },
      error: reject,
      complete: () => {
        if (hasConfig) {
          resolve(config && config.defaultValue);
        } else {
          reject(new EmptyError());
        }
      }
    });
    source.subscribe(subscriber);
  });
}
