'use strict';
const assert = require('assert');

const REGIONS = [
  'cn-hangzhou', // 华东1 杭州
  'cn-shanghai', // 华东2 上海
  'cn-shanghai-finance-1', // 华东2（上海金融云)
  'cn-qingdao', // 华北1 青岛
  'cn-beijing', // 华北2 北京
  'cn-zhangjiakou', // 华北3 张家口
  'cn-huhehaote', // 华北 呼和浩特
  'cn-shenzhen', // 华南1 深圳
  'cn-hongkong', // Hongkong
  'cn-shenzhen-finance-1	', // 华南1（深圳金融云）
  'ap-southeast-1', // Singapore 亚太东南(新加坡)
  'ap-northeast-1', // Japan 亚太东北(日本)
  'ap-southeast-2', // Sydney 亚太东南(悉尼)
  'ap-southeast-3', // Malaysia 亚太东南（马来西亚)
  'eu-central-1', // Europ 欧洲中部(法兰克福)
  'me-east-1', // Dubai 中东东部(迪拜)
];

module.exports = (region, isVpc) => {
  assert(REGIONS.includes(region), `region ${region} is not support`);
  return `kms${isVpc ? '-vpc' : ''}.${region}.aliyuncs.com`;
};
