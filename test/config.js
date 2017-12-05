'use strict';

module.exports = function() {
  return {
    accessKey: process.env.KMS_ACCESS_KEY,
    accessSecret: process.env.KMS_ACCESS_SECRET,
    region: process.env.KMS_REGION,
  };
};
