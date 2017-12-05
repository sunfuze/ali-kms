'use strict';

const _ = require('lodash');
const assert = require('assert');
const kms = require('../index');
const getConfig = require('./config');

const KEY_SPEC = kms.KEY_SPEC;

describe('test/kms.test.js', function() {
  let keyId;

  const config = getConfig();
  const kmsClient = kms(config);

  after(async function() {
    await kmsClient.scheduleKeyDeletion(keyId, 7);
  });

  it('create encrypt/descrypt key should ok', async function() {
    const result = await kmsClient.createKey({ description: 'for test' });
    keyId = _.result(result, 'KeyId');
    assert(keyId);
    assert(_.result(result, 'KeyUsage') === 'ENCRYPT/DECRYPT');
  });

  it('encrypt/decrypt key should ok', async function() {
    const plaintext = 'test';
    const { CiphertextBlob: ciphertext } = await kmsClient.encrypt(keyId, { plaintext });

    const { Plaintext: newPlaintext } = await kmsClient.decrypt({ ciphertext });
    assert.equal(plaintext, newPlaintext);
  });

  it('encrypt/decrtpt key with context should ok', async function() {
    const plaintext = 'test';
    const context = { key: 'value' };
    const { CiphertextBlob: ciphertext } = await kmsClient.encrypt(keyId, { plaintext, context });

    const { Plaintext: newPlaintext } = await kmsClient.decrypt({ ciphertext, context });
    assert.equal(plaintext, newPlaintext);
  });

  it('describe key should ok', async function() {
    const result = await kmsClient.describeKey(keyId);
    assert.equal(_.result(result, 'KeyId'), keyId);
  });

  it('disable key should ok', async function() {
    const { KeyId: newKey } = await kmsClient.createKey({ description: 'for disable' });
    await kmsClient.disableKey(newKey);

    const result = await kmsClient.describeKey(newKey);
    assert.equal(_.result(result, 'KeyState'), 'Disabled');
  });

  it('enable key should ok', async function() {
    await kmsClient.disableKey(keyId);
    let result = await kmsClient.describeKey(keyId);
    assert.equal(_.result(result, 'KeyState'), 'Disabled');
    await kmsClient.enableKey(keyId);
    result = await kmsClient.describeKey(keyId);
    assert.equal(_.result(result, 'KeyState'), 'Enabled');
  });

  it('describe regions should ok', async function() {
    const result = await kmsClient.describeRegions();
    assert(Array.isArray(result));
  });

  it('list keys should ok', async function() {
    const result = await kmsClient.listKeys({ pageNumber: 1 });
    assert(Array.isArray(result.List));
  });

  it('generate data key should ok', async function() {
    const { CiphertextBlob: ciphertext, Plaintext } = await kmsClient.generateDataKey(keyId, { keySpec: KEY_SPEC.AES_128 });
    const { Plaintext: plaintext } = await kmsClient.decrypt({ ciphertext });
    assert.equal(plaintext, Plaintext);
  });
  
  it('scheduleKeyDeletion should ok', async function() {
    await kmsClient.scheduleKeyDeletion(keyId, 7);
    const keyDescription = await kmsClient.describeKey(keyId);
    assert(keyDescription.DeleteDate);
  });

  it('cancelKeyDeletion should ok', async function() {
    await kmsClient.cancelKeyDeletion(keyId);
    const keyDescription = await kmsClient.describeKey(keyId);
    assert(!keyDescription.DeleteDate);
  });
});

// GET&%2F&AccessKeyId%3DLTAIFn4k5vAXXe3N%26Action%3DEncrypt%26Encryptioncontext%3Dundefined%26Format%3DJSON%26Keyid%3D05703f33-aa42-4f4a-80b4-a4a071bf5e3f%26Plaintext%3Dtest%26SignatureMethod%3DHMAC-SHA1%26SignatureVersion%3D1.0%26Timestamp%3D2017-12-05T00%253A56%253A05%252B08%253A00%26Version%3D2016-01-20
// GET&%2F&AccessKeyId%3DLTAIFn4k5vAXXe3N%26Action%3DEncrypt%26Encryptioncontext%3D%26Format%3DJSON%26Keyid%3D05703f33-aa42-4f4a-80b4-a4a071bf5e3f%26Plaintext%3Dtest%26SignatureMethod%3DHMAC-SHA1%26SignatureVersion%3D1.0%26Timestamp%3D2017-12-05T00%253A56%253A05%252B08%253A00%26Version%3D2016-01-20