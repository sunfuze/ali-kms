'use strict';
const assert = require('assert');
const signer = require('../../lib/signer');

describe('test/lib/signer.test.js', function() {
  const obj = {
    Action: 'CreateKey',
    SignatureVersion: '1.0',
    Format: 'json',
    Version: '2016-01-20',
    AccessKeyId: 'testid',
    SignatureMethod: 'HMAC-SHA1',
    Timestamp: '2016-03-28T03:13:08Z',
  };
  const method = 'GET';
  const testKey = 'testsecret';

  it('sign should ok', function() {
    const afterSignObj = signer.sign({ method, target: obj }, testKey);
    assert.equal(afterSignObj.Signature, '41wk2SSX1GJh7fwnc5eqOfiJPFg=');
  });
});
