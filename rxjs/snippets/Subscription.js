/* eslint-disable complexity */
/* eslint-disable no-use-before-define */
/* eslint-disable no-nested-ternary */

// represents a disposable resource, such as the execution of an Observable.
// a Subscription has one important method, `unsubscribe`, that takes

const { arrRemove, isFunction, UnsubscriptionError } = require('./utils');

// no argument and just disposes the resource held by the subscription.
class Subscription /* implements SubscriptionLike  */ {
  static EMPTY = (() => {
    const empty = new Subscription();
    empty.closed = true;
    return empty;
  })();

  _parentage /* : Subscription[] | Subscription | null */ = null;

  // the list of registered teardowns to execute upon unsubscription. adding and
  // removing from this list occurs in the `#add` and `#remove` methods.
  _teardowns /* : Exclude<TeardownLogic, void>[] | null */ = null;

  // a flag to indicate whether this Subscription has already been unsubscribed.
  closed = false;

  // the `initialTeardown` function executed first as part of the teardown
  // process that is kicked off when `#unsubscribe` is called.
  constructor(initialTeardown /* ?: () => void */) {
    this.initialTeardown = initialTeardown;
  }

  // disposes the resources held by the subscription.
  // may, for instance, cancel an ongoing Observable
  // execution or cancel any other type of work that
  // started when the Subscription was created.
  unsubscribe() /* : void */ {
    let errors;

    if (!this.closed) {
      this.closed = true;

      // remove this from it's parents.
      const { _parentage } = this;
      if (_parentage) {
        this._parentage = null;
        if (Array.isArray(_parentage)) {
          for (const parent of _parentage) {
            parent.remove(this);
          }
        } else {
          _parentage.remove(this);
        }
      }

      const { initialTeardown } = this;
      if (isFunction(initialTeardown)) {
        try {
          initialTeardown();
        } catch (err) {
          errors = err instanceof UnsubscriptionError ? err.errors : [err];
        }
      }

      const { _teardowns } = this;
      if (_teardowns) {
        this._teardowns = null;
        for (const teardown of _teardowns) {
          try {
            execTeardown(teardown);
          } catch (err) {
            errors = errors ?? [];
            if (err instanceof UnsubscriptionError) {
              errors = [...errors, ...err.errors];
            } else {
              errors.push(err);
            }
          }
        }
      }

      if (errors) {
        throw new UnsubscriptionError(errors);
      }
    }
  }

  // checks to see if a this subscription already has a particular parent.
  // this will signal that this subscription has already been added to the
  // parent in question.
  _hasParent(parent /* : Subscription */) {
    const { _parentage } = this;
    return (
      _parentage === parent ||
      (Array.isArray(_parentage) && _parentage.includes(parent))
    );
  }

  // adds a parent to this subscription so it can be removed from the parent
  // if it unsubscriptions on it's own.
  _addParent(parent /* : Subscription */) {
    const { _parentage } = this;
    this._parentage = Array.isArray(_parentage)
      ? (_parentage.push(parent), _parentage)
      : _parentage
        ? [_parentage, parent]
        : parent;
  }

  // called on a child when it is removed via `#remove`.
  _removeParent(parent /* : Subscription */) {
    const { _parentage } = this;
    if (_parentage === parent) {
      this._parentage = null;
    } else if (Array.isArray(_parentage)) {
      arrRemove(_parentage, parent);
    }
  }

  /**
   * Adds a teardown to this subscription, so that teardown will be
   * unsubscribed/called when this subscription is unsubscribed.
   * If this subscription is already `#closed`, because it has already
   * been unsubscribed, then whatever teardown is passed to it will
   * automatically be executed (unless the teardown itself is also a
   * closed subscription).
   *
   * Closed Subscriptions cannot be added as teardowns to any subscription.
   * Adding a closed subscription to a any subscription will result in
   * no operation. (A noop).
   *
   * Adding a subscription to itself, or adding `null` or `undefined` will
   * not perform any operation at all. (A noop).
   *
   * `Subscription` instances that are added to this instance will automatically
   * remove themselves if they are unsubscribed. Functions and `Unsubscribable`
   * objects that you wish to remove will need to be removed manually with `#remove`
   */
  add(teardown /* : TeardownLogic */) /* : void */ {
    // only add the teardown if it's not undefined
    // and don't add a subscription to itself.
    if (teardown && teardown !== this) {
      if (this.closed) {
        // if this subscription is already closed,
        // execute whatever teardown is handed to it automatically.
        execTeardown(teardown);
      } else {
        if (teardown instanceof Subscription) {
          if (teardown.closed || teardown._hasParent(this)) {
            return;
          }
          teardown._addParent(this);
        }
        (this._teardowns = this._teardowns ? this._teardowns : []).push(teardown);
      }
    }
  }

  // removes a teardown from this subscription that was previously
  // added with the `#add` method.
  remove(teardown /* : Exclude<TeardownLogic, void> */) /* : void */ {
    const { _teardowns } = this;
    _teardowns && arrRemove(_teardowns, teardown);

    if (teardown instanceof Subscription) {
      teardown._removeParent(this);
    }
  }
}

const EMPTY_SUBSCRIPTION = Subscription.EMPTY;

function execTeardown(teardown /* : Unsubscribable | (() => void) */) {
  if (isFunction(teardown)) {
    teardown();
  } else {
    teardown.unsubscribe();
  }
}

function isSubscription(value) {
  return (
    (value && value instanceof Subscription) ||
    (value &&
      'closed' in value &&
      isFunction(value.remove) &&
      isFunction(value.add) &&
      isFunction(value.unsubscribe))
  );
}

module.exports = {
  EMPTY_SUBSCRIPTION,
  Subscription,
  isSubscription,
};
