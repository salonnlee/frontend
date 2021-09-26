import { SafeSubscriber, Subscriber } from "./Subscriber";
import { isSubscription } from "./Subscription";
import { observable as Symbol_observable } from "./symbol/observable";
import { pipeFromArray } from "./util/pipe";
import { isFunction } from "./util/isFunction";
import { errorContext } from "./util/errorContext";

// a representation of any set of values over any amount of time.
// this is the most basic building block of RxJS.
export class Observable {
  // internal implementation detail, do not use directly. will be made internal in v8.
  source;
  // internal implementation detail, do not use directly. will be made internal in v8.
  operator;

  // subscribe the function that is called when the Observable is initially subscribed to.
  // this function is given a Subscriber, to which new values can be `next`ed, or an `error`
  // method can be called to raise an error, or `complete` can be called to notify of a
  // successful completion.
  constructor(subscribe) {
    if (subscribe) {
      this._subscribe = subscribe;
    }
  }

  // HACK: since TypeScript inherits static properties too, we have to
  // fight against TypeScript here so Subject can have a different static
  // create signature.
  static create = (subscribe) => {
    return new Observable(subscribe);
  };

  // create a new Observable, with this Observable instance as the source,
  // and the passed operator defined as the new observable's operator.
  lift(operator) {
    const observable = new Observable();
    observable.source = this;
    observable.operator = operator;
    return observable;
  }

  /**
   * Invokes an execution of an Observable and registers Observer handlers for notifications it will emit.
   *
   * `subscribe` is not a regular operator, but a method that calls Observable's internal `subscribe` function. It
   * might be for example a function that you passed to Observable's constructor, but most of the time it is
   * a library implementation, which defines what will be emitted by an Observable, and when it be will emitted. This means
   * that calling `subscribe` is actually the moment when Observable starts its work, not when it is created, as it is often
   * the thought.
   *
   * Apart from starting the execution of an Observable, this method allows you to listen for values
   * that an Observable emits, as well as for when it completes or errors. You can achieve this in two
   * of the following ways.
   *
   * The first way is creating an object that implements `Observer` interface. It should have methods
   * defined by that interface, but note that it should be just a regular JavaScript object, which you can create
   * yourself in any way you want (ES6 class, classic function constructor, object literal etc.). In particular, do
   * not attempt to use any RxJS implementation details to create Observers - you don't need them. Remember also
   * that your object does not have to implement all methods. If you find yourself creating a method that doesn't
   * do anything, you can simply omit it. Note however, if the `error` method is not provided and an error happens,
   * it will be thrown asynchronously. Errors thrown asynchronously cannot be caught using `try`/`catch`. Instead,
   * use the `onUnhandledError` configuration option or use a runtime handler (like `window.onerror` or
   * `process.on('error)`) to be notified of unhandled errors. Because of this, it's recommended that you provide
   * an `error` method to avoid missing thrown errors.
   *
   * The second way is to give up on Observer object altogether and simply provide callback functions in place of its methods.
   * This means you can provide three functions as arguments to `subscribe`, where the first function is equivalent
   * of a `next` method, the second of an `error` method and the third of a `complete` method. Just as in case of an Observer,
   * if you do not need to listen for something, you can omit a function by passing `undefined` or `null`,
   * since `subscribe` recognizes these functions by where they were placed in function call. When it comes
   * to the `error` function, as with an Observer, if not provided, errors emitted by an Observable will be thrown asynchronously.
   *
   * You can, however, subscribe with no parameters at all. This may be the case where you're not interested in terminal events
   * and you also handled emissions internally by using operators (e.g. using `tap`).
   *
   * Whichever style of calling `subscribe` you use, in both cases it returns a Subscription object.
   * This object allows you to call `unsubscribe` on it, which in turn will stop the work that an Observable does and will clean
   * up all resources that an Observable used. Note that cancelling a subscription will not call `complete` callback
   * provided to `subscribe` function, which is reserved for a regular completion signal that comes from an Observable.
   *
   * Remember that callbacks provided to `subscribe` are not guaranteed to be called asynchronously.
   * It is an Observable itself that decides when these functions will be called. For example {@link of}
   * by default emits all its values synchronously. Always check documentation for how given Observable
   * will behave when subscribed and if its default behavior can be modified with a `scheduler`.
   */
  subscribe(observerOrNext, error, complete) {
    const subscriber = isSubscriber(observerOrNext)
      ? observerOrNext
      : new SafeSubscriber(observerOrNext, error, complete);

    errorContext(() => {
      const { operator, source } = this;
      subscriber.add(
        operator
          ? // We're dealing with a subscription in the
            // operator chain to one of our lifted operators.
            operator.call(subscriber, source)
          : source
          ? // If `source` has a value, but `operator` does not, something that
            // had intimate knowledge of our API, like our `Subject`, must have
            // set it. We're going to just call `_subscribe` directly.
            this._subscribe(subscriber)
          : // In all other cases, we're likely wrapping a user-provided initializer
            // function, so we need to catch errors and handle them appropriately.
            this._trySubscribe(subscriber)
      );
    });

    return subscriber;
  }

  _trySubscribe(sink) {
    try {
      return this._subscribe(sink);
    } catch (err) {
      // we don't need to return anything in this case.
      // because it's just going to try to `add()` to
      // a subscription above.
      sink.error(err);
    }
  }

  // used as a NON-CANCELLABLE means of subscribing to an observable, for use with
  // APIs that export promises, like `async/await`. You cannot unsubscribe from this.
  forEach(next, promiseCtor) {
    promiseCtor = getPromiseCtor(promiseCtor);

    return new promiseCtor((resolve, reject) => {
      // must be declared in a seperate statement to avoid a ReferenceError when
      // accessing subscription below in the closure due to Temporal Dead Zone.
      let subscription;
      subscription = this.subscribe(
        (value) => {
          try {
            next(value);
          } catch (err) {
            reject(err);
            subscription && subscription.unsubscribe();
          }
        },
        reject,
        resolve
      );
    });
  }

  _subscribe(subscriber) {
    return this.source && this.source.subscribe(subscriber);
  }

  // an interop point defined by the es7-observable spec https://github.com/zenparsing/es-observable
  [Symbol_observable]() {
    return this;
  }

  // used to stitch together functional operators into a chain.
  pipe(...operations) {
    return pipeFromArray(operations)(this);
  }

  // subscribe to this Observable and get a Promise resolving on
  // `complete` with the last emission (if any).
  toPromise(promiseCtor) {
    promiseCtor = getPromiseCtor(promiseCtor);

    return new promiseCtor((resolve, reject) => {
      let value;
      this.subscribe(
        (x) => (value = x),
        (err) => reject(err),
        () => resolve(value)
      );
    });
  }
}

function getPromiseCtor(promiseCtor) {
  return promiseCtor ? promiseCtor : Promise;
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
