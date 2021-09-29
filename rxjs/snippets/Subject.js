import Observable from './Observable';
import { EMPTY_SUBSCRIPTION, Subscription } from './Subscription';
import { arrRemove } from './utils';

// a Subject is a special type of Observable that allows values to be
// multicasted to many Observers. Subjects are like EventEmitters.
//
// every Subject is an Observable and an Observer. you can subscribe to a
// Subject, and you can call next to feed values as well as error and complete.
// eslint-disable-next-line max-len
class Subject /* <T> */ extends Observable /* <T> implements SubscriptionLike */ {
  closed = false;
  observers = [];
  isStopped = false;
  hasError = false;
  thrownError = null;

  constructor() {
    // NOTE: this must be here to obscure Observable's constructor.
    super();
  }

  _throwIfClosed() {
    if (this.closed) {
    // throw new ObjectUnsubscribedError();
    }
  }

  next(value) {
    this._throwIfClosed();
    if (!this.isStopped) {
      for (const observer of this.observers.slice()) {
        observer.next(value);
      }
    }
  }

  error(err) {
    this._throwIfClosed();
    if (!this.isStopped) {
      this.hasError = this.isStopped = true;
      this.thrownError = err;
      while (this.observers.length) {
        const observer = this.observers.shift();
        observer && observer.error(err);
      }
    }
  }

  complete() {
    this._throwIfClosed();
    if (!this.isStopped) {
      this.isStopped = true;
      while (this.observers.length) {
        const observer = this.observers.shift();
        observer && observer.complete();
      }
    }
  }

  unsubscribe() {
    this.isStopped = this.closed = true;
    this.observers = null;
  }

  get observed() {
    return this.observers && this.observers.length > 0;
  }

  _trySubscribe(subscriber) {
    this._throwIfClosed();
    return super._trySubscribe(subscriber);
  }

  _subscribe(subscriber) {
    this._throwIfClosed();
    this._checkFinalizedStatuses(subscriber);
    return this._innerSubscribe(subscriber);
  }

  _innerSubscribe(subscriber) {
    const { hasError, isStopped, observers } = this;
    return hasError || isStopped
      ? EMPTY_SUBSCRIPTION
      : (observers.push(subscriber),
      new Subscription(() => arrRemove(observers, subscriber)));
  }

  _checkFinalizedStatuses(subscriber) {
    const { hasError, thrownError, isStopped } = this;
    if (hasError) {
      subscriber.error(thrownError);
    } else if (isStopped) {
      subscriber.complete();
    }
  }

  asObservable() {
    const observable = new Observable();
    observable.source = this;
    return observable;
  }
}

module.exports = {
  Subject
};
