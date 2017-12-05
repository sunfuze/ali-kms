'use strict';
const assert = require('assert');
const path = require('path');
const ini = require('ini');
const fs = require('fs');
const DEFAULT_CONFIG_PATH = path.join(process.env.HOME, '.kmsconfig');

module.exports = function(filepath = DEFAULT_CONFIG_PATH) {
  filepath = filepath.trim();
  if (filepath.indexOf('~') === 0) {
    filepath = filepath.replace('~', process.env.HOME);
  } else if (filepath.indexOf('/') !== 0) {
    filepath = path.resolve(process.cwd(), filepath);
  }
  filepath = path.resolve(filepath);

  const exists = fs.existsSync(filepath);
  assert(exists, `${filepath} is not exists`);

  const stat = fs.statSync(filepath);
  assert(stat.isFile(), `${filepath} is not a file`);

  try {
    fs.accessSync(filepath, fs.constants.R_OK);
  } catch (e) {
    throw new Error(`no privilege to read ${filepath}`);
  }

  const config = ini.parse(fs.readFileSync(filepath, 'utf8'));
  assert(config.accessKey, `${filepath} should contain accessKey`);
  assert(config.accessSecret, `${filepath} should contain accessSecret`);
  assert(config.entrypoint || config.region, `${filepath} should contain one of entrypoin, region`);
  return config;
};
