/* eslint-disable complexity */
/* eslint-disable no-use-before-define */
/* eslint-disable no-param-reassign */

const { Subscription } = require('./Subscription');
const { isFunction } = require('./utils');

// Subscriber is a common type in RxJS, and crucial for implementing operators.
// while the Observer is the public API for consuming the values of an Observable.
//
// all Observers get converted to a Subscriber, in order to provide Subscription-like
// capabilities such as `unsubscribe`.
class Subscriber /* <T> */ extends Subscription /* implements Observer<T> */ {
  unsubscribe() {
    this.isStopped = true;
    super.unsubscribe();
    this.destination = null;
  }

  // ------------------------------

  next(value) {
    if (this.isStopped) {
      // handleStoppedNotification(nextNotification(value), this);
    } else {
      this._next(value);
    }
  }

  error(err) {
    if (this.isStopped) {
      // handleStoppedNotification(errorNotification(err), this);
    } else {
      this.isStopped = true;
      this._error(err);
    }
  }

  complete() {
    if (this.isStopped) {
      // handleStoppedNotification(completeNotification(err), this);
    } else {
      this.isStopped = true;
      this._complete();
    }
  }

  // ------------------------------

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

class SafeSubscriber extends Subscriber {
  destination /* : Observer<any> */;

  constructor(
    observerOrNext /* ?: Partial<Observer<T>> | ((value: T) => void) | null */,
    error /* ?: ((error?: any) => void) | null */,
    complete /* ?: (() => void) | null */
  ) {
    super();

    let next;
    if (isFunction(observerOrNext)) {
      next = observerOrNext;
    } else if (observerOrNext) {
      ({ next, error, complete } = observerOrNext);
      const context = observerOrNext;
      next = next && next.bind(context);
      error = error && error.bind(context);
      complete = complete && complete.bind(context);
    }

    this.destination = {
      next: next ? next : () => {},
      error: error
        ? error
        : (err) => {
          throw err;
        },
      complete: complete ? complete : () => {}
    };
  }
}

const EMPTY_OBSERVER = {
  next: () => {},
  error: (err) => {
    throw err;
  },
  complete: () => {}
};

module.exports = { Subscriber, SafeSubscriber, EMPTY_OBSERVER };
