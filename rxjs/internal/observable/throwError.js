import { Observable } from "../Observable";
import { isFunction } from "../util/isFunction";

// create an observable that will create an error instance and push it to the consumer as an error
// immediately upon subscription.
export function throwError(errorOrErrorFactory, scheduler) {
  const errorFactory = isFunction(errorOrErrorFactory)
    ? errorOrErrorFactory
    : () => errorOrErrorFactory;
  const init = (subscriber) => subscriber.error(errorFactory());
  return new Observable(
    scheduler ? (subscriber) => scheduler.schedule(init, 0, subscriber) : init
  );
}
