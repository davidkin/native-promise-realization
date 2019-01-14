const RESOLVED = 'RESOLVED';
const PENDING = 'PENDING';
const REJECTED = 'REJECTED';

const isResolved = () => this.state = RESOLVED;
const isRejected = () => this.state = REJECTED;

class OwnPromise {
  constructor(executer) {
    this.state = PENDING;
    this.callbacks = [];

    if (typeof executer !== 'function') {
      throw new TypeError('Executer is not function');
    }

    const resolve = data => {
      // console.log('in resolve')
      if (this.state !== PENDING) {
        return;
      }

      if (this.__isThenable(data) && data.state === PENDING) {
        // console.log('data.then')
        data.then(v => resolve(v), v => reject(v));
      } else {
        this.state = this.__isThenable(data) ? data.state : RESOLVED;
        this.value = this.__isThenable(data) ? data.value : data;
        // console.log('in resolve', this.state, this.value)

        this.__callHandlers();
      }
    };

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
        this.state === RESOLVED ? setTimeout(() => internalOnfulfill(this.value), 0) : setTimeout(() => internalOnreject(this.value), 0);
      }
    });
  }

  catch(onRejected) {
    return this.then(onRejected);
  }

  static resolve(data) {
    return new OwnPromise((resolve, reject) => {
      resolve(data);
    });
  }
}


module.exports = OwnPromise;