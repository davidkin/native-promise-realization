const RESOLVED = 'RESOLVED';
const PENDING = 'PENDING';
const REJECTED = 'REJECTED';

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

      this.state = REJECTED;
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
      }

      this.state = this.__isThenable(data) ? data.state : RESOLVED;
      this.value = this.__isThenable(data) ? data.value : data;

      this.__callHandlers();
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
    return this.then(null, onRejected);
  }

  static resolve(data) {
    if (typeof this !== 'function') {
      throw new TypeError('this is not instance from Own Promise');
    }

    if (data instanceof OwnPromise) {
      return data;
    }

    return new this((resolve, reject) => {
      if (typeof resolve !== 'function' || typeof reject !== 'function') {
        throw new TypeError('Not a function');
      }

      resolve(data);
    });
  }

  static reject(error) {
    if (typeof this !== 'function') {
      throw new TypeError('this is not instance from Own Promise');
    }

    return new this((resolve, reject) => {
      if (typeof resolve !== 'function' || typeof reject !== 'function') {
        throw new TypeError('Not a function');
      }
      reject(error);
    });
  }

  static race(iterable) {
    if (typeof this !== 'function') {
      throw new TypeError('this is not instance from OwnPromise');
    }

    if (!Array.isArray(iterable)) {
      return this.reject(new TypeError('Not an array'));
    }

    return new this((resolve, reject) => {
      if (typeof resolve !== 'function' || typeof reject !== 'function') {
        throw new TypeError('Not a function');
      }

      iterable.forEach(value => value.then(resolve, reject));
    });
  }

  static all(iterable) {
    if (typeof this !== 'function') {
      throw new TypeError('this is not a constructor');
    }

    return new this((resolve, reject) => {
      if (typeof resolve !== 'function' || typeof reject !== 'function') {
        throw new TypeError('Not a function');
      }

      const isIterable = object => object !== null && typeof object[Symbol.iterator] === 'function';

      if (!isIterable(iterable)) {
        throw new TypeError('ERROR');
      }

      const isEmptyIterable = iterable => {
        for (const key of iterable) {
          return true;
        }
        return false;
      };

      if (!isEmptyIterable(iterable)) {
        return resolve([]);
      }

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
        const promise = iterable[i] instanceof OwnPromise
          ? iterable[i]
          : new OwnPromise(res => { res(iterable[i]); });

        promise.then(tryResolve(i), reject);
      }
    });
  }
}

module.exports = OwnPromise;