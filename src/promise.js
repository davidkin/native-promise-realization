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

    const resolve = data => {
      if (this.state !== PENDING) {
        return;
      }

      this.state = RESOLVED;

      if (data instanceof OwnPromise) {
        data.then(promise => this.value = promise);
      }

      this.value = data;

      this.callbacks.forEach(({ onFulfilled }) => {
        this.value = onFulfilled(this.value);
      });
    };

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

    try {
      executer(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    if (this.state === PENDING) {
      this.callbacks.push({ onFulfilled, onRejected });
      return this;
    }

    this.callbacks.push({ onFulfilled, onRejected });

    return new OwnPromise((resolve, reject) => {
      try {
        const res = onFulfilled(this.value);
        setTimeout(() => {
          resolve(res);
        });
      } catch (err) {
        const res = onRejected(err);
        reject(res);
      }
    });
  }

  catch(onRejected) {
    return this.then(onRejected);
  }
}

const p = new OwnPromise(function(resolve, reject) {
  setTimeout(() => {
  // console.log('resolve');
    resolve('value');
  }, 1000);
});


p.then(v => {
  console.log('1');
  return 'then 1';
}).then(v => {
  console.log('4');
  return 'then 2';
});

p.then(v => {
  console.log('2');
});
p.then(v => {
  console.log('3');
});

module.exports = OwnPromise;
