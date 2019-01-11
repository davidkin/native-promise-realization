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

      // setTimeout(() => {
      // this.callbacks.forEach(({ onFulfilleded }) => {
      // this.value = onFulfilleded();
      // });
      // });

      this.__callHandlers();
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

  __callHandlers() {
    // console.log('in callHandlers', this.callbacks);

    const run =
    () => {
      let onFulfilled = null;
      let onRejected = null;

      // while (this.callbacks.length > 0 && ({onFulfilled, onRejected} = this.callbacks.shift())) {
      for (let i = 0; i < this.callbacks.length; i++) {
        // const {
        //   this.callbacks[i],

        // }
        onFulfilled = this.callbacks[i].onFulfilled;
        onRejected = this.callbacks[i].onRejected;

        if (this.callbacks.length - 1 === i) {
          this.value = this.state === RESOLVED ? onFulfilled(this.value) : onRejected(this.value);
        } else {
          this.state === RESOLVED ? onFulfilled(this.value) : onRejected(this.value);
        }
      }
    };

    setTimeout(run, 0);
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
        // setTimeout(() => {
        resolve(res);
        // }, 0);
      } catch (err) {
        const res = onRejected(err);
        reject(res);
      }
    });
  }

  catch(onRejecteded) {
    return this.then(onRejecteded);
  }
}

const p = new OwnPromise(function(resolve, reject) {
  setTimeout(() => {
    resolve('value');
  }, 1000);
});


p.then(v => {
  console.log('1');
})
  .then(v => {
    console.log('4');
  });

p.then(v => {
  console.log('2');
});

p.then(v => {
  console.log('3');
});

// module.exports = OwnPromise;
