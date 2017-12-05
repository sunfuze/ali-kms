'use strict';
const assert = require('assert');
const getEntrypoint = require('../../lib/entrypoint');

describe('test/lib/entrypoint.test.js', function() {
  it('should get entrypoint ok', function() {
    const entrypoint = getEntrypoint('me-east-1');
    assert(entrypoint === 'kms.me-east-1.aliyuncs.com');
  });

  it('should get vpc entrypoint ok', function() {
    const enp = getEntrypoint('me-east-1', true);
    assert(enp === 'kms-vpc.me-east-1.aliyuncs.com');
  });

  it('should throw err if region not exists', function() {
    assert.throws(() => {
      getEntrypoint('illegal-region');
    }, Error);
  });
});
