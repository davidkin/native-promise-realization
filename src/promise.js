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


    try {
      executer(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
}


module.exports = OwnPromise;