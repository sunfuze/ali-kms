'use strict';

const crypto = require('crypto');
const moment = require('moment');
const debug = require('debug')('kms:signer');

const REPLACES = [
  [ '*', '%2A' ], // replace '*' to '%2A'
  [ '~', '%7E' ],
];

const ENCODED_SLASH = '%2F';

function encode(str) {
  return REPLACES.reduce((acc, [ raw, replacer ]) => {
    return acc.replace(raw, replacer);
  }, encodeURIComponent(str));
}

function canonicalizedQueryString(obj = {}) {
  return Object.keys(obj).sort()
    .map(key => {
      return `${encode(key)}=${encode(obj[key])}`;
    })
    .join('&');
}

const SIGNER_INFO = {
  SignatureVersion: '1.0',
  SignatureMethod: 'HMAC-SHA1',
};

const getTimestamp = () => `${moment().format('YYYY-MM-DDTHH:mm:ssZ')}`;

exports.sign = ({ method = 'GET', target = {} }, key) => {
  target = Object.assign({ Timestamp: getTimestamp() }, target, SIGNER_INFO);
  const strToSign = [
    method,
    ENCODED_SLASH,
    encode(canonicalizedQueryString(target)),
  ].join('&');
  debug('string to sign:', strToSign);
  const hmac = crypto.createHmac('sha1', key + '&');
  hmac.update(strToSign);
  target.Signature = hmac.digest('base64');
  return target;
};
