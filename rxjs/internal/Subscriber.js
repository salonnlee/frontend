import { isFunction } from "./util/isFunction";
import { isSubscription, Subscription } from "./Subscription";
import { reportUnhandledError } from "./util/reportUnhandledError";
import { noop } from "./util/noop";
import {
  nextNotification,
  errorNotification,
  COMPLETE_NOTIFICATION
} from "./NotificationFactories";

export class Subscriber extends Subscription {
  static create(next, error, complete) {
    return new SafeSubscriber(next, error, complete);
  }

  isStopped = false;
  destination;

  constructor(destination) {
    super();
    if (destination) {
      this.destination = destination;
      if (isSubscription(destination)) {
        destination.add(this);
      }
    } else {
      this.destination = EMPTY_OBSERVER;
    }
  }

  next(value) {
    if (this.isStopped) {
      handleStoppedNotification(nextNotification(value), this);
    } else {
      this._next(value);
    }
  }

  error(err) {
    if (this.isStopped) {
      handleStoppedNotification(errorNotification(err), this);
    } else {
      this.isStopped = true;
      this._error(err);
    }
  }

  complete() {
    if (this.isStopped) {
      handleStoppedNotification(COMPLETE_NOTIFICATION, this);
    } else {
      this.isStopped = true;
      this._complete();
    }
  }

  unsubscribe() {
    if (!this.closed) {
      this.isStopped = true;
      super.unsubscribe();
      this.destination = null;
    }
  }

  _next(value) {
    this.destination.next(value);
  }

  _error(err) {
    try {
      this.destination.error(err);
    } finally {
      this.unsubscribe();
    }
  }

  _complete() {
    try {
      this.destination.complete();
    } finally {
      this.unsubscribe();
    }
  }
}

export class SafeSubscriber extends Subscriber {
  constructor(observerOrNext, error, complete) {
    super();

    let next;
    if (isFunction(observerOrNext)) {
      next = observerOrNext;
    } else if (observerOrNext) {
      ({ next, error, complete } = observerOrNext);
      let context;
      if (this) {
        context = Object.create(observerOrNext);
        context.unsubscribe = () => this.unsubscribe();
      } else {
        context = observerOrNext;
      }
      next = next && next.bind(context);
      error = error && error.bind(context);
      complete = complete && complete.bind(context);
    }

    this.destination = {
      next: next ? wrapForErrorHandling(next, this) : noop,
      error: wrapForErrorHandling(error ? error : defaultErrorHandler, this),
      complete: complete ? wrapForErrorHandling(complete, this) : noop
    };
  }
}

function wrapForErrorHandling(handler, instance) {
  return (...args) => {
    try {
      handler(...args);
    } catch (err) {
      reportUnhandledError(err);
    }
  };
}

function defaultErrorHandler(err) {
  throw err;
}

function handleStoppedNotification(notification, subscriber) {
  // do nothing
}

export const EMPTY_OBSERVER = {
  closed: true,
  next: noop,
  error: defaultErrorHandler,
  complete: noop
};
