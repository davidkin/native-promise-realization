const RESOLVED = 'RESOLVED';
const PENDING = 'PENDING';
const REJECTED = 'REJECTED';

const isResolved = () => {
  this.state = RESOLVED;
};

const isRejected = () => {
  this.state = REJECTED;
};

// const isIterable = function(subject) {
//   return subject !== null && typeof subject[Symbol.iterator] === 'function';
// };


// const validateIterable = subject => {
//   if (isIterable(subject)) {
//     return;
//   }

//   throw new TypeError(`Cannot read property 'Symbol(Symbol.iterator)' of ${Object.prototype.toString.call(subject)}.`);
// };


class OwnPromise {
  constructor(executer) {
    this.state = PENDING;
    this.callbacks = [];

    if (typeof executer !== 'function') {
      throw new TypeError('Executer is not function');
    }

    const reject = error => {
      if (this.state !== PENDING) {
        return;
      }

      this.state = isRejected();
      this.value = error;

      this.callbacks.forEach(({ onRejected }) => {
        this.value = onRejected(error);
      });
    };


    const resolve = data => {
      if (this.state !== PENDING) {
        return;
      }

      if (this.__isThenable(data) && data.state === PENDING) {
        data.then(v => resolve(v), v => reject(v));
      } else {
        this.state = this.__isThenable(data) ? data.state : RESOLVED;
        this.value = this.__isThenable(data) ? data.value : data;

        this.__callHandlers();
      }
    };

    try {
      executer(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  __isThenable(obj) {
    return obj && obj.then;
  }
  __callHandlers() {
    const run = () => {
      this.callbacks.forEach((callback, i) => {
        const { onFulfilled, onRejected } = callback;

        if (this.callbacks.length === i) {
          this.value = this.state === RESOLVED ? onFulfilled(this.value) : onRejected(this.value);
        }

        this.state === RESOLVED ? onFulfilled(this.value) : onRejected(this.value);
      });
    };

    setTimeout(run, 0);
  }

  then(onFulfilled, onRejected) {
    return new this.constructor((resolve, reject) => {
      const internalOnfulfill = value => {
        try {
          resolve(onFulfilled(value));
        } catch (error) {
          reject(error);
        }
      };

      const internalOnreject = reason => {
        if (onRejected && typeof onRejected === 'function') {
          try {
            resolve(onRejected(reason));
          } catch (error) {
            reject(error);
          }
        } else {
          reject(reason);
          throw new TypeError('callback must be a function');
        }
      };

      if (this.state === PENDING) {
        this.callbacks.push({ onFulfilled: internalOnfulfill, onRejected: internalOnreject });
      } else if (this.callbacks.length > 0) {
        this.__callHandlers();
      } else {
        this.state === RESOLVED
          ? setTimeout(() => internalOnfulfill(this.value), 0)
          : setTimeout(() => internalOnreject(this.value), 0);
      }
    });
  }

  catch(onRejected) {
    return this.then(onRejected);
  }

  static resolve(data) {
    if (typeof this !== 'function') {
      throw new TypeError('this is not instance from Own Promise');
    }

    if (data instanceof OwnPromise) {
      return data;
    }

    return new OwnPromise((resolve, reject) => {
      resolve(data);
    });
  }

  static reject(error) {
    if (typeof this !== 'function') {
      throw new TypeError('this is not instance from Own Promise');
    }

    return new OwnPromise((resolve, reject) => {
      reject(error);
    });
  }

  static race(iterable) {
    if (typeof this !== 'function') {
      throw new TypeError('this is not instance from OwnPromise');
    }

    return new OwnPromise((resolve, reject) => {
      iterable.forEach(value => value.then(resolve, reject));
    });
  }

  static all(iterable) {
    if (typeof this !== 'function') {
      throw new TypeError('this is not a constructor');
    }

    return new OwnPromise((resolve, reject) => {
      const values = new Array(iterable.length);
      let counter = 0;

      const tryResolve = i => value => {
        values[i] = value;
        counter += 1;

        if (counter === iterable.length) {
          resolve(values);
        }
      };

      for (let i = 0; i < iterable.length; i++) {
        const promise = iterable[i];
        promise.then(tryResolve(i), reject);
      }
    });
  }
}

// const p1 = OwnPromise.resolve(3);
// const p2 = 133;
// const p3 = new OwnPromise((resolve, reject) => {
//   setTimeout(resolve, 100, 'foo');
// });

// OwnPromise.all([p1, p2, p3]).then(values => {
//   console.log(values);
// });

// Выведет:
// [3, 1337, "foo"]


module.exports = OwnPromise;