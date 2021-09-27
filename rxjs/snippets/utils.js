/* eslint-disable yoda */
/* eslint-disable no-use-before-define */

// --------------------------------------------------

const Symbol_observable = (() =>
  (typeof Symbol === 'function' && Symbol.observable) || '@@observable')();

const Symbol_iterator = (() =>
  (typeof Symbol === 'function' && Symbol.iterator) || '@@iterator')();

// --------------------------------------------------

function isFunction(value) {
  return typeof value === 'function';
}

function noop() {}

function identity(x) {
  return x;
}

function pipe(...fns) {
  return pipeFromArray(fns);
}

function pipeFromArray(fns) {
  if (fns.length === 0) {
    return identity;
  }

  if (fns.length === 1) {
    return fns[0];
  }

  return function piped(input) {
    return fns.reduce((prev, fn) => fn(prev), input);
  };
}

function arrRemove(arr, item) {
  if (arr) {
    const index = arr.indexOf(item);
    0 <= index && arr.splice(index, 1);
  }
}

// --------------------------------------------------

function getPromiseCtor(promiseCtor) {
  return promiseCtor ? promiseCtor : Promise;
}

// --------------------------------------------------

function createErrorClass(createImpl) {
  const _super = (instance) => {
    Error.call(instance);
    instance.stack = new Error().stack;
  };

  const ctorFunc = createImpl(_super);
  ctorFunc.prototype = Object.create(Error.prototype);
  ctorFunc.prototype.constructor = ctorFunc;
  return ctorFunc;
}

const UnsubscriptionError = createErrorClass(
  (_super) =>
    function UnsubscriptionErrorImpl(errors) {
      _super(this);
      this.message = errors
        ? `${errors.length} errors occurred during unsubscription:
${errors.map((err, i) => `${i + 1}) ${err.toString()}`).join('\n  ')}`
        : '';
      this.name = 'UnsubscriptionError';
      this.errors = errors;
    }
);

// --------------------------------------------------

module.exports = {
  Symbol_observable,
  Symbol_iterator,
  // ----------
  isFunction,
  noop,
  identity,
  pipe,
  pipeFromArray,
  arrRemove,
  // ----------
  getPromiseCtor,
  // ----------
  UnsubscriptionError,
};
