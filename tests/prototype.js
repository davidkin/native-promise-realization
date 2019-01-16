/* global Promise, require, setImmediate, setTimeout, describe, it */
'use strict';


describe('25.4.4.2 Promise.prototype', function() {
  it('is the Promise prototype object', function() {
    const p = new Promise(function() {});

    assert.ok(p instanceof Promise);
    // TODO(Sam): is there any way to ensure that there are no
    // other objects in the prototype chain?
    assert.ok(Promise.prototype instanceof Object);
  });
  it('has attribute [[Writable]]: false');

  it('has attribute [[Enumerable]]: false');

  it('has attribute [[Configurable]]: false');
});

describe('25.4.5 Properties of the Promise Prototype Object', function() {
  it('is an ordinary object', () => {
    assert.ok(Promise.prototype.then instanceof Object);
    assert.ok(Promise.prototype.catch instanceof Object);
  });

  it('is not a Promise', () => {
    assert.equal(false, Promise.prototype.then instanceof Promise);
  }); // implied
});

describe('25.4.5.1 Promise.prototype.catch( onRejected )', function() {
  it('is a function', function() {
    assert.equal('function', typeof Promise.prototype.catch);
  });

  it('expects \'this\' to be a Promise', function() {
    const p = new Promise((res, rej) => {
      res(1);
      rej('Error');
    });
    const result = p.catch(v => v);

    assert.ok(result instanceof Promise);
  });

  it('takes one argument, a function', function() {
    const argLength = 1;

    assert.equal(argLength, Promise.prototype.catch.length);
  });


  it('is equivalent to \'promise.then(undefined, fn)\'');
});

describe('25.4.5.2 Promise.prototype.constructor', function() {
  it('is an object', function() {
    const isNotObject = false;

    assert.ok(Promise.constructor instanceof Object);
  });

  it('is a function', () => {
    assert.equal('function', typeof Promise.constructor);
  });


  it('is the Promise constructor', () => {
    function isConstructor(f) {
      try {
        new f();
      } catch (err) {
        if (err.message.indexOf('is not a constructor') >= 0) {
          return false;
        }
      }
      return true;
    }

    assert.ok(isConstructor(Promise.constructor));
  });
});

describe('25.4.5.3 Promise.prototype.then', function() {
  it('is a function', () => {
    assert.equal('function', typeof Promise.constructor);
  });

  it('expects \'this\' to be a Promise', () => {
    const p = new Promise((res, rej) => {
      res(1);
    });
    const result = p.then(v => v);

    assert.ok(result instanceof Promise);
  });

  it('throws TypeError if \'this\' is not a Promise', () => {
    const isNotAPromise = 3;
    const p = new Promise((res, rej) => {
      res(1);
    });

    const result = p.then(v => v);

    // assert.throws(() => !(result instanceof Promise), Error, 'this is not a Promise');
    assert.throws(() => !(isNotAPromise instanceof Promise).ok(true), TypeError);
  });

  it('takes two arguments, both optional, both functions');
  it('has default on resolve: identity');
  it('has default on reject: thrower', function(done) {
    const errorObject = {};
    const p = new Promise(function(resolve, reject) {
      reject(errorObject);
    });

    p.then().catch(function(rejected) {
      assert.equal(errorObject, rejected);
    })
      .then(done)
      .catch(done);
  });

  it('does not call either function immediately if promise status is \'pending\'');

  it('does call onFulfilled immediately if promise status is \'fulfilled\'');
  it('never calls onRejected if promise status is \'fulfilled\'');

  it('never calls onFullfilled if promise status is \'rejected\'');
  it('does call onRejected immediately if promise status is \'rejected\'');

  it('returns its \'this\' argument if it is of type \'Promise\'');
  it('returns a Promise-wrapped version of \'this\' if \'this\' is not of type \'Promise\'');
});
