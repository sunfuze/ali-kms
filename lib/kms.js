'use strict';

const assert = require('assert');
const Base = require('sdk-base');
const _ = require('lodash');
const urllib = require('urllib');
const debug = require('debug')('kms');
const signer = require('./signer');
const getEntrypoint = require('./entrypoint');

// api doc: https://help.aliyun.com/document_detail/28946.html

const PUBLIC_PARAMS = {
  Format: 'JSON',
  Version: '2016-01-20',
};

const capitalize = function(str) {
  return str.replace(/^[a-z]/, character => character.toUpperCase());
};

class Kms extends Base {
  /**
   * @constructor
   * @param {Object} options kms client options
   * - {String} options.accessKey kms accessKey
   * - {String} options.accessSecret kms accessSecret
   * - {String} [options.region] host region
   * - {String} options.entrypoint api entrypoint
   * - {Number} options.timeout request timeout
   */
  constructor(options = {}) {
    super();
    debug('options:', options);
    assert(options.accessKey, 'accessKey is required');
    assert(options.accessSecret, 'accessSecret is required');
    if (options.region) {
      options.entrypoint = getEntrypoint(options.region, options.vpc);
    }
    assert(options.entrypoint, 'entrypoint is required');
    this.options = options;
    this.host = `https://${options.entrypoint}/`;
    this.timeout = options.timeout || '5000';
  }

  get accessKey() {
    return this.options.accessKey;
  }

  get accessSecret() {
    return this.options.accessSecret;
  }

  /**
   * create encrypt key
   * @param {Object} params params
   * @param {String} params.description key descrition
   * @param {String/Array} params.keyUsage key usage
   * @param {Object} [options] options
   * @return {Promise<Object>} result
   */
  createKey({ description = '' } = {}, options) {
    return this._request('CreateKey', { description, keyUsage: 'ENCRYPT/DECRYPT' }, options)
      .then(result => _.result(result, 'KeyMetadata'));
  }

  /**
   * decrypt string
   * @param {Object} params params
   * @param {String} params.ciphertext cipher text to decrypt
   * @param {Ojbect/String} [params.context] encryption context
   * @param {Object} [options] options
   * @return {Promise<Object>} result
   */
  decrypt({ ciphertext, context = {} } = {}, options) {
    assert(ciphertext, 'ciphertext is required');
    if (context && typeof context === 'object') {
      context = JSON.stringify(context);
    }
    return this._request('Decrypt', { CiphertextBlob: ciphertext, EncryptionContext: context }, options);
  }

  /**
   * encrypt string
   * @param {String} keyId key id
   * @param {Object} params params
   * @param {String} params.plaintext plain text to encrypt
   * @param {Ojbect/String} [params.context] encryption context
   * @param {Object} [options] options
   * @return {Promise<Object>} result
   */
  encrypt(keyId, { plaintext, context = {} } = {}, options) {
    assert(keyId, 'keyId is required');
    assert(plaintext, 'plaintext is required');
    if (context && typeof context === 'object') {
      context = JSON.stringify(context);
    }
    return this._request('Encrypt', { keyId, plaintext, EncryptionContext: context }, options);
  }

  /**
   * get description of key
   * @param {String} keyId key id
   * @param {Object} [options] options
   * @return {Promise<Object>} result
   */
  describeKey(keyId, options) {
    assert(keyId, 'keyId is required');
    return this._request('DescribeKey', { keyId }, options)
      .then(result => _.result(result, 'KeyMetadata'));
  }

  /**
   * get available regions
   * @param {Object} [options] options
   * @return {Prmose<Object>} regions
   */
  describeRegions(options) {
    return this._request('DescribeRegions', {}, options)
      .then(result => _.result(result, 'Regions.Region'));
  }

  /**
   * generate data secret key
   * @param {String} keyId key id
   * @param {Object} params params
   * @param {String} params.keySpec key spec
   * @param {Number} params.length length of data secret key
   * @param {Object/String} [params.context] encryption context
   * @param {Object} [options] options
   * @return {Promise<Object>} result
   */
  generateDataKey(keyId, { keySpec, length, context = {} } = {}, options) {
    assert(keyId, 'keyId is required');
    assert(keySpec, 'keySpec is required');
    if (context && typeof context === 'object') {
      context = JSON.stringify(context);
    }
    const params = { keyId, keySpec, EncryptionContext: context };
    if (length) params.NumberOfBytes = length;
    return this._request('GenerateDataKey', params, options);
  }

  /**
   * list all keyId
   * @param {Object} params params
   * @param {Number} params.pageNumber page number
   * @param {Number} params.pageSize page size
   * @param {Object} [options] options
   * @return {Promise<List>} result
   */
  listKeys({ pageNumber = 1, pageSize = 10 } = {}, options) {
    return this._request('ListKeys', { pageNumber, pageSize }, options)
      .then(result => {
        return {
          List: result.Keys.Key,
          TotalCount: result.TotalCount,
          PageNumber: result.PageNumber,
          PageSize: result.PageSize,
        };
      });
  }

  /**
   * add delete keyId task
   * @param {String} keyId key id
   * @param {Number} delayDays deply days to real delete keyId
   * @param {Object} [options] options
   * @return {Promise<Boolean>} result
   */
  scheduleKeyDeletion(keyId, delayDays = 7, options) {
    assert(keyId, 'keyId is required');
    delayDays = delayDays < 7
      ? 7
      : delayDays > 30
        ? 30
        : delayDays;
    return this._request('ScheduleKeyDeletion', { keyId, PendingWindowInDays: delayDays }, options)
      .then(() => true);
  }

  /**
   * cancel delete key
   * @param {String} keyId key id
   * @param {Object} [options] options
   * @return {Promise<Boolean>} result
   */
  cancelKeyDeletion(keyId, options) {
    assert(keyId, 'keyId is required');
    return this._request('CancelKeyDeletion', { keyId }, options)
      .then(() => true);
  }

  /**
   * enable key
   * @param {String} keyId key id
   * @param {Object} [options] options
   * @return {Promise} result
   */
  enableKey(keyId, options) {
    assert(keyId, 'keyId is required');
    return this._request('EnableKey', { keyId }, options)
      .then(() => true);
  }

  /**
   * disable key
   * @param {String} keyId key id
   * @param {Object} [options] options
   * @return {Promise<Boolean>} result
   */
  disableKey(keyId, options) {
    assert(keyId, 'keyId is required');
    return this._request('DisableKey', { keyId }, options);
  }

  /**
   * request to kms server
   * @private
   * @param {String} action action
   * @param {Object} params params
   * @param {Object} [options] options
   * @return {Promise<Object>} result
   */
  _request(action, params = {}, options = {}) {
    params = Object.keys(params).reduce((acc, key) => {
      acc[capitalize(key)] = params[key];
      return acc;
    }, {});
    params = Object.assign({ Action: action, AccessKeyId: this.accessKey }, PUBLIC_PARAMS, params);
    const data = signer.sign({ target: params }, this.accessSecret);
    this.emit('request', data);
    return urllib.request(this.host, Object.assign({ timeout: this.timeout, dataType: 'json' }, options, { data }))
      .then(result => {
        const err = getError(result);
        if (err) {
          this.emit('err', err);
          throw err;
        }
        return result.data;
      });
  }
}

function getError(result) {
  let err;
  if (result.status >= 400) {
    if (_.result(result, 'data.Code')) {
      err = new Error(_.result(result, 'data.Message'));
      err.code = _.result(result, 'data.Code');
      err.requestId = _.result(result, 'data.RequestId');
      err.status = result.status;
      if (_.result(result, 'data.StringToSign')) {
        err.stringToSign = _.result(result, 'data.StringToSign');
      }
    } else {
      err = new Error(`Unknow error, status: ${result.status}`);
    }
  }
  if (err) debug('error:', err);
  return err;
}

module.exports = function(config) {
  return new Kms(config);
};

module.exports.KEY_SPEC = {
  AES_256: 'AES_256',
  AES_128: 'AES_128',
};


// GET&%2F&AccessKeyId%3DLTAIFn4k5vAXXe3N%26Action%3DEncrypt%26EncryptionContext%3D%257B%2522key%2522%253A%2522value%2522%257D%26Format%3DJSON%26KeyId%3D9d1e5092-ef97-43b8-bbb2-b0e8955fdefe%26Plaintext%3D%26SignatureMethod%3DHMAC-SHA1%26SignatureVersion%3D1.0%26Timestamp%3D2017-12-05T01%253A12%253A08%252B08%253A00%26Version%3D2016-01-20
// GET&%2F&AccessKeyId%3DLTAIFn4k5vAXXe3N%26Action%3DEncrypt%26EncryptionContext%3D%257B%2522key%2522%253A%2522value%2522%257D%26Format%3DJSON%26KeyId%3D9d1e5092-ef97-43b8-bbb2-b0e8955fdefe%26Plaintext%3Dundefined%26SignatureMethod%3DHMAC-SHA1%26SignatureVersion%3D1.0%26Timestamp%3D2017-12-05T01%253A12%253A08%252B08%253A00%26Version%3D2016-01-20
