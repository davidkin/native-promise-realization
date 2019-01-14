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


    try {
      executer(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
}


module.exports = OwnPromise;