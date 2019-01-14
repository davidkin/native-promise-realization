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

        if (callback.length - 1 === i) {
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
}


// const p = new OwnPromise((res, rej) => {
//   res(1);
// });

// const a = p.then(v => console.log(1)).then(v => console.log(2));

// const b = p.then(v => console.log(3));

// console.log('---', a);
// console.log('---', b);


module.exports = OwnPromise;