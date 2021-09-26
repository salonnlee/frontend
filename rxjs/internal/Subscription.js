import { isFunction } from "./util/isFunction";
import { UnsubscriptionError } from "..";
import { arrRemove } from "./util/arrRemove";

/**
 * Represents a disposable resource, such as the execution of an Observable. A
 * Subscription has one important method, `unsubscribe`, that takes no argument
 * and just disposes the resource held by the subscription.
 *
 * Additionally, subscriptions may be grouped together through the `add()`
 * method, which will attach a child Subscription to the current Subscription.
 * When a Subscription is unsubscribed, all its children (and its grandchildren)
 * will be unsubscribed as well.
 */
export class Subscription {
  static EMPTY = (() => {
    const empty = new Subscription();
    empty.closed = true;
    return empty;
  })();

  // a flag to indicate whether this Subscription has already been unsubscribed.
  closed = false;

  _parentage = null;

  // the list of registered teardowns to execute upon unsubscription.
  // adding and removing from this list occurs in the `#add` and `#remove` methods.
  _teardown = null;

  // initialTeardown a function executed first as part of the teardown
  // process that is kicked off when `#unsubscribe` is called.
  constructor(initialTeardown) {
    this.initialTeardown = initialTeardown;
  }

  unsubscribe() {
    let errors;

    if (!this.closed) {
      this.closed = true;

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
            errors = errors ? errors : [];
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

  add(teardown) {
    // Only add the teardown if it's not undefined
    // and don't add a subscription to itself.
    if (teardown && teardown !== this) {
      if (this.closed) {
        // If this subscription is already closed,
        // execute whatever teardown is handed to it automatically.
        execTeardown(teardown);
      } else {
        if (teardown instanceof Subscription) {
          // We don't add closed subscriptions, and we don't add the same subscription
          // twice. Subscription unsubscribe is idempotent.
          if (teardown.closed || teardown._hasParent(this)) {
            return;
          }
          teardown._addParent(this);
        }
        (this._teardowns = this._teardowns ? this._teardowns : []).push(
          teardown
        );
      }
    }
  }

  _hasParent(parent) {
    const { _parentage } = this;
    return (
      _parentage === parent ||
      (Array.isArray(_parentage) && _parentage.includes(parent))
    );
  }

  _addParent(parent) {
    const { _parentage } = this;
    this._parentage = Array.isArray(_parentage)
      ? (_parentage.push(parent), _parentage)
      : _parentage
      ? [_parentage, parent]
      : parent;
  }

  _removeParent(parent) {
    const { _parentage } = this;
    if (_parentage === parent) {
      this._parentage = null;
    } else if (Array.isArray(_parentage)) {
      arrRemove(_parentage, parent);
    }
  }

  remove(teardown) {
    const { _teardown } = this;
    _teardown && arrRemove(_teardown, teardown);

    if (teardown instanceof Subscription) {
      teardown._removeParent(this);
    }
  }
}

export const EMPTY_SUBSCRIPTION = Subscription.EMPTY;

export function isSubscription(value) {
  return (
    value instanceof Subscription ||
    (value &&
      "closed" in value &&
      isFunction(value.remove) &&
      isFunction(value.add) &&
      isFunction(value.unsubscribe))
  );
}

export function isSubscription(value) {
  return (
    value instanceof Subscription ||
    (value &&
      "closed" in value &&
      isFunction(value.remove) &&
      isFunction(value.add) &&
      isFunction(value.unsubscribe))
  );
}

function execTeardown(teardown) {
  if (isFunction(teardown)) {
    teardown();
  } else {
    teardown.unsubscribe();
  }
}
