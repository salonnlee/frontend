/* eslint-disable no-use-before-define */
/* eslint-disable prefer-const */
/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */

const { SafeSubscriber, Subscriber } = require('./Subscriber');
const { isSubscription } = require('./Subscription');
const { Symbol_observable, pipeFromArray, isFunction } = require('./utils');

// a representation of any set of values over any amount of time.
// this is the most basic building block of RxJS.
class Observable /* <T> implements Subscribable<T> */ {
  _subscriber;
  /* ?: (this: Observable<T>, subscriber: Subscriber<T>) => Subscription */
  constructor(
    subscriber
    /* ?: (this: Observable<T>, subscriber: Subscriber<T>) => Subscription */
  ) {
    if (subscriber) {
      this._subscriber = subscriber;
    }
  }

  [Symbol_observable]() {
    return this;
  }

  subscribe(
    observerOrNext /* ?: Partial<Observer<T>> | ((value: T) => void) | null */,
    error /* ?: ((error: any) => void) | null */,
    complete /* ?: (() => void) | null */
  ) /* : SubScription */ {
    const subscriber = isSubscriber(observerOrNext)
      ? observerOrNext
      : new SafeSubscriber(observerOrNext, error, complete);

    subscriber.add(this._subscriber(subscriber));

    return subscriber;
  }

  pipe(...operations /* : OperatorFunction<any, any>[] */) /* : Observable<any> */ {
    return pipeFromArray(operations)(this);
  }
}

function isObserver(value) {
  return (
    value &&
    isFunction(value.next) &&
    isFunction(value.error) &&
    isFunction(value.complete)
  );
}

function isSubscriber(value) {
  return (
    (value && value instanceof Subscriber) ||
    (isObserver(value) && isSubscription(value))
  );
}

const observable = new Observable((subscriber) => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  setTimeout(() => {
    subscriber.next(4);
    subscriber.complete();
  }, 1000);
});

console.log('just before subscribe');
observable.subscribe({
  next(x) {
    console.log('got value ' + x);
  },
  error(err) {
    console.error('something wrong occurred: ' + err);
  },
  complete() {
    console.log('done');
  },
});
console.log('just after subscribe');

module.exports = Observable;
