const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class Promise {
  static resolve(value) {
    if (value instanceof Promise) {
      return value;
    }
    return new Promise((resolve) => {
      resolve(value);
    });
  }
  static reject(reason) {
    return new Promise((_, reject) => {
      reject(reason);
    });
  }

  static all(promiseList) {
    return new Promise((resolve, reject) => {
      const result = [];
      const length = promiseList.length;
      let count = 0;

      if (length === 0) {
        return resolve(result);
      }

      promiseList.forEach((promise, index) => {
        Promise.resolve(promise).then(
          (value) => {
            count++;
            result[index] = value;
            if (count === length) {
              resolve(result);
            }
          },
          (reason) => {
            reject(reason);
          }
        );
      });
    });
  }
  static allSettled = (promiseList) => {
    return new Promise((resolve) => {
      const length = promiseList.length;
      const result = [];
      let count = 0;

      if (length === 0) {
        return resolve(result);
      } else {
        for (let i = 0; i < length; i++) {
          const currentPromise = Promise.resolve(promiseList[i]);
          currentPromise.then(
            (value) => {
              count++;
              result[i] = {
                status: "fulfilled",
                value: value
              };
              if (count === length) {
                return resolve(result);
              }
            },
            (reason) => {
              count++;
              result[i] = {
                status: "rejected",
                reason: reason
              };
              if (count === length) {
                return resolve(result);
              }
            }
          );
        }
      }
    });
  };
  static race(promiseList) {
    return new Promise((resolve, reject) => {
      const length = promiseList.length;

      if (length === 0) {
        return resolve();
      } else {
        for (let i = 0; i < length; i++) {
          Promise.resolve(promiseList[i]).then(
            (value) => {
              return resolve(value);
            },
            (reason) => {
              return reject(reason);
            }
          );
        }
      }
    });
  }

  constructor(executor) {
    try {
      executor(this.resolve, this.reject);
    } catch (error) {
      this.reject(error);
    }
  }

  status = PENDING;

  value = null;
  reason = null;

  onFulfilledCallbacks = [];
  onRejectedCallbacks = [];

  resolve = (value) => {
    if (this.status === PENDING) {
      this.status = FULFILLED;
      this.value = value;
      while (this.onFulfilledCallbacks.length) {
        this.onFulfilledCallbacks.shift()(value);
      }
    }
  };
  reject = (reason) => {
    if (this.status === PENDING) {
      this.status = REJECTED;
      this.reason = reason;
      while (this.onRejectedCallbacks.length) {
        this.onRejectedCallbacks.shift()(reason);
      }
    }
  };

  then = (onFulfilled, onRejected) => {
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw reason;
          };

    const newPromise = new Promise((resolve, reject) => {
      const fulfilledQueueMicrotask = () => {
        queueMicrotask(() => {
          try {
            const result = onFulfilled(this.value);
            resolvePromise(result, newPromise, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      };
      const rejectedQueueMicrotask = () => {
        queueMicrotask(() => {
          try {
            const result = onRejected(this.reason);
            resolvePromise(result, newPromise, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      };

      if (this.status === FULFILLED) {
        fulfilledQueueMicrotask();
      } else if (this.status === REJECTED) {
        rejectedQueueMicrotask();
      } else if (this.status === PENDING) {
        this.onFulfilledCallbacks.push(fulfilledQueueMicrotask);
        this.onRejectedCallbacks.push(rejectedQueueMicrotask);
      }
    });
    return newPromise;
  };
  catch = (onRejected) => {
    this.then(undefined, onRejected);
  };
  finally = (fn) => {
    return this.then(
      (value) => {
        return Promise.resolve(fn()).then(() => {
          return value;
        });
      },
      (error) => {
        return Promise.resolve(fn()).then(() => {
          throw error;
        });
      }
    );
  };
}

function resolvePromise(target, promise, resolve, reject) {
  if (target === promise) {
    return reject(
      new TypeError("The promise and the return value are the same")
    );
  }

  if (typeof target === "object" || typeof target === "function") {
    if (target === null) {
      return resolve(target);
    }

    let then;
    try {
      then = target.then;
    } catch (error) {
      return reject(error);
    }

    if (typeof then === "function") {
      let called = false;
      try {
        then.call(
          target,
          (value) => {
            if (called) return;
            called = true;
            resolvePromise(value, promise, resolve, reject);
          },
          (reason) => {
            if (called) return;
            called = true;
            reject(reason);
          }
        );
      } catch (error) {
        if (called) return;
        reject(error);
      }
    } else {
      resolve(target);
    }
  } else {
    resolve(target);
  }
}

// Promise.resolve()
//   .then(() => {
//     console.log(0);
//     return Promise.resolve(4);
//   })
//   .then((res) => {
//     console.log(res);
//   });

// Promise.resolve()
//   .then(() => {
//     console.log(1);
//   })
//   .then(() => {
//     console.log(2);
//   })
//   .then(() => {
//     console.log(3);
//   })
//   .then(() => {
//     console.log(5);
//   })
//   .then(() => {
//     console.log(6);
//   });

// 1 -> 2 -> 3 -> 4 -> 5 -> 6

Promise.deferred = function () {
  const result = {};
  result.promise = new Promise((resolve, reject) => {
    result.resolve = resolve;
    result.reject = reject;
  });

  return result;
};

module.exports = Promise;
