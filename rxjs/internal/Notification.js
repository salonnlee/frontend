import { EMPTY } from "./observable/empty";
import { of } from "./observable/of";
import { throwError } from "./observable/throwError";
import { isFunction } from "./util/isFunction";

export const NotificationKind = {
  NEXT: "N",
  ERROR: "E",
  COMPLETE: "C"
};

// represents a push-based event or value that an `Observable` can emit.
export class Notification {
  kind;
  value;
  error;
  hasValue;

  constructor(kind, value, error) {
    // NEXT => { kind: 'N', value }
    // ERROR => { kind: 'E', value: undefined, error }
    // COMPLETE => { kind: 'C' }
    this.kind = kind;
    this.value = value;
    this.error = error;
    this.hasValue = kind === "N";
  }

  // executes the appropriate handler on a passed `observer` given the `kind` of notification.
  observe(observer) {
    return observeNotification(this, observer);
  }

  // executes a notification on the appropriate handler form a list provided.
  do(nextHandler, errorHandler, completeHandler) {
    const { kind, value, error } = this;
    return kind === "N"
      ? nextHandler && nextHandler(value)
      : kind === "E"
      ? errorHandler && errorHandler(error)
      : completeHandler && completeHandler();
  }

  // executes the appropriate handler on a passed `observer` given the `kind` of notification.
  accept(nextOrObserver, error, complete) {
    return isFunction(nextOrObserver && nextOrObserver.next)
      ? this.observe(nextOrObserver)
      : this.do(nextOrObserver, error, complete);
  }

  // return a simple Observable that just delivers the notification represented
  // by this Notification instance.
  toObservable() {
    const { kind, value, error } = this;
    // Select the observable to return by `kind`
    const result =
      kind === "N"
        ? // Next kind. Return an observable of that value
          of(value)
        : kind === "E"
        ? // Error kind. Return an observable that emits the error.
          throwError(() => error)
        : kind === "C"
        ? // Completion kind. Kind is "C", return an observable that just completes.
          EMPTY
        : // Unknown kind, return falsy, so we error below.
          0;
    if (!result) {
      throw new TypeError(`Unexpected notification kind ${kind}`);
    }
    return result;
  }

  // a shortcut to create a Notification instance of the type `next`
  // from a given value.
  static createNext(value) {
    return new Notification("N", value);
  }

  // a shortcut to create a Notification instance of the type `error`
  // from a given error.
  static createError(err) {
    return new Notification("E", undefined, err);
  }

  // a shortcut to create a Notification instance of the type `complete`.
  static createComplete() {
    return new Notification("C");
  }
}

// executes the appropriate handler on passed `observer` given the `kind` of notification.
export function observeNotification(notification, observer) {
  const { kind, value, error } = notification;
  if (typeof kind !== "string") {
    throw new Error('Invalid notification, missing "kind"');
  }
  kind === "N"
    ? observer.next && observer.next(value)
    : kind === "E"
    ? observer.error && observer.error(error)
    : observer.complete && observer.complete();
}
