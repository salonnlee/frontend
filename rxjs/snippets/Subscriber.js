/* eslint-disable complexity */
/* eslint-disable no-use-before-define */
/* eslint-disable no-param-reassign */

const { Subscription } = require('./Subscription');
const { isFunction, noop, isSubscription } = require('./utils');

class Subscriber extends Subscription /* implements Observer<T> */ {
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
      // handleStoppedNotification(COMPLETE_NOTIFICATION, this);
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

class SafeSubscriber extends Subscriber {
  constructor(observerOrNext, error, complete) {
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
      next: next ? next : noop,
      error: error
        ? error
        : (err) => {
          throw err;
        },
      complete: complete ? complete : noop,
    };
  }
}

const EMPTY_OBSERVER = {
  closed: true,
  next: noop,
  error: (err) => {
    throw err;
  },
  complete: noop,
};

module.exports = { Subscriber, SafeSubscriber, EMPTY_OBSERVER };
