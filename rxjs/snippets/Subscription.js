/* eslint-disable complexity */
/* eslint-disable no-use-before-define */
/* eslint-disable no-nested-ternary */

const { arrRemove, isFunction, UnsubscriptionError } = require('./utils');

// represents a disposable resource,
// such as the execution of an Observable.
class Subscription /* implements Unsubscribable */ {
  _parentage /* : Subscription[] | Subscription | null */ = null;
  _teardowns /* : Supscription[] | null */ = null;

  closed = false;

  constructor(initialTeardown) {
    this.initialTeardown = initialTeardown;
  }

  // ------------------------------

  unsubscribe() /* : void 0 */ {
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

  // ------------------------------

  add(teardown /* : Subscription */) /* : void */ {
    if (teardown && teardown !== this) {
      if (this.closed) {
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

  remove(teardown /* : Subscription */) /* : void */ {
    const { _teardowns } = this;
    _teardowns && arrRemove(_teardowns, teardown);

    if (teardown instanceof Subscription) {
      teardown._removeParent(this);
    }
  }

  // ------------------------------

  _hasParent(parent /* : Subscription */) {
    const { _parentage } = this;
    return (
      _parentage === parent ||
      (Array.isArray(_parentage) && _parentage.includes(parent))
    );
  }
  _addParent(parent /* : Subscription */) {
    const { _parentage } = this;
    this._parentage = Array.isArray(_parentage)
      ? (_parentage.push(parent), _parentage)
      : _parentage
        ? [_parentage, parent]
        : parent;
  }
  _removeParent(parent /* : Subscription */) {
    const { _parentage } = this;
    if (_parentage === parent) {
      this._parentage = null;
    } else if (Array.isArray(_parentage)) {
      arrRemove(_parentage, parent);
    }
  }
}

const EMPTY_SUBSCRIPTION = (() => {
  const empty = new Subscription();
  empty.closed = true;
  return empty;
})();

function execTeardown(teardown) {
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
  isSubscription
};
