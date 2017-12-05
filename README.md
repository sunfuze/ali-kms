[ali-kms](https://help.aliyun.com/document_detail/28935.html)
=======

## Install

```bash
$ npm i ali-kms -S
```

## Usage as command

install

```bash
$ npm i -g ali-kms
$ ali-kms --help 
```

> ali-kms use $HOME/.kmsconfig as default config file.

## Usage as package

### Prepare

You need create a new RAM strategy to manager kms.

```json
{
  "Version": "1",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "kms:*",
      "Resource": [
        "acs:kms:*:*:key",
        "acs:kms:*:*:key/*"
      ]
    }
  ]
}
```

This case have all privileges to manager kms. You can customize strategy follow the RAM [doc](https://help.aliyun.com/document_detail/28663.html).


### Regions

[Kms Resgions](https://help.aliyun.com/document_detail/43350.html)

| Name | ReginId | Publish Domain | VPC Domain |
| :---: | :---: | :---: | :---: |
| 华东1 |	cn-hangzhou |	kms.cn-hangzhou.aliyuncs.com |	kms-vpc.cn-hangzhou.aliyuncs.com |
| 华东2	 | cn-shanghai | 	kms.cn-shanghai.aliyuncs.com | 	kms-vpc.cn-shanghai.aliyuncs.com | 
| 华东2（上海金融云)	 | cn-shanghai-finance-1	 | kms.cn-shanghai-finance-1.aliyuncs.com	 | kms-vpc.cn-shanghai-finance-1.aliyuncs.com | 
| 华北1（青岛）	| cn-qingdao	| kms.cn-qingdao.aliyuncs.com	| kms-vpc.cn-qingdao.aliyuncs.com | 
| 华北2	 | cn-beijing	 | kms.cn-beijing.aliyuncs.com	 | kms-vpc.cn-beijing.aliyuncs.com | 
| 华北3（张家口）	| cn-zhangjiakou	| kms.cn-zhangjiakou.aliyuncs.com	| kms-vpc.cn-zhangjiakou.aliyuncs.com | 
| 华北5（呼和浩特）	| cn-huhehaote	| kms.cn-huhehaote.aliyuncs.com	| kms-vpc.cn-huhehaote.aliyuncs.com | 
| 华南1	 | cn-shenzhen	 | kms.cn-shenzhen.aliyuncs.com	 | kms-vpc.cn-shenzhen.aliyuncs.com | 
| 华南1（深圳金融云）	 | cn-shenzhen-finance-1	 | kms.cn-shenzhen-finance-1.aliyuncs.com	 | kms-vpc.cn-shenzhen-finance-1.aliyuncs.com | 
| 香港	| cn-hongkong	| kms.cn-hongkong.aliyuncs.com	| kms-vpc.cn-hongkong.aliyuncs.com | 
| 亚太东北(日本)	 | ap-northeast-1	 | kms.ap-northeast-1.aliyuncs.com | 	kms-vpc.ap-northeast-1.aliyuncs.com | 
| 亚太东南(悉尼)	| ap-southeast-2	| kms.ap-southeast-2.aliyuncs.com	| kms-vpc.ap-southeast-2.aliyuncs.com | 
| 亚太东南(新加坡)| ap-southeast-1|	kms.ap-southeast-1.aliyuncs.com	| kms-vpc.ap-southeast-1.aliyuncs.com |
| 亚太东南（马来西亚）	| ap-southeast-3	| kms.ap-southeast-3.aliyuncs.com	| kms-vpc.ap-southeast-3.aliyuncs.com | 
| 欧洲中部(法兰克福)	 | eu-central-1	 | kms.eu-central-1.aliyuncs.com	 | kms-vpc.eu-central-1.aliyuncs.com | 
| 中东东部(迪拜)	| me-east-1 |	kms.me-east-1.aliyuncs.com	| kms-vpc.me-east-1.aliyuncs.com | 

### Create A Kms Client
#### KMS(options)
Create A KMS Client

options:
- accessKey {String} access key
- accessSecret {String} access secret
- [region] {String} region to using kms
- [entrypoint] {String} region domain. if you have region in options, entrypoint will auto generate.
- [vpc] {Boolean} if you use kms in vpc, make vpc to be `true`
- [timeout] {Number} request timeout

Example:

```js
const KMS = require('kms');
const options = {
  accessKey: 'abc',
  accessSecret: 'abc',
  region: 'cn-hangzhou',
  // entrypoint: 'kms-vpc.cn-hangzhou.aliyuncs.com'
  vpc: true,
  timeout: 6000
}
const kms = KMS(options);
```

### Operations

#### .describeRegions(options)
List all available regions

Parameters:

- [options] {Object} request options
  - timeout {Number} request timeout, Unit: ms

Example:

```js
const regions = await kms.describeRegions();

const { 
  RegionId
} = regions[0];

```

#### .createKey(params, options)
Create an encrypt/decrypt key

Parameters:

- params {Object} create key params
  - description {String} key description
- [options] {Object} request options
  - timeout {Number} request timeout, Unit: ms

Example:

```js
const { KeyId } = await kms.createKey({ description: 'for you' });
```

#### .listKeys(params, options)
List all keys

Parameters:

- [params] list params
  - [pageNumber=1] {Number} page number
  - [pageSize=10] {Number} page size
- [options] {Object} request options
  - timeout {Number} request timeout, Unit: ms

Example: 

```js
const { List, TotalCount, PageNumber, PageSize } = await kms.listKeys({ pageNumber: 2, pageSize: 15 });
```

#### .describeKey(keyId, options)
Get detail of key

Parameters:

- keyId {String} key id
- [options] {Object} request options
  - timeout {Number} request timeout, Unit: ms

Example:

```js
const {
  CreationDate,
  Description,
  KeyId,
  KeyState,
  KeyUsage,
  DeleteDate,
  Creator
} = await kms.describeKey('your key id');

```

#### .encrypt(keyId, params, options)
Encrypt plaintext

Parameters:

- keyId {String} encrypt key
- params {Object} encrypt params
  - plaintext {String} plaintext to encrypt
  - [context] {Object} platten json, encryption context
- [options] {Object} request options
  - timeout {Number} request timeout, Unit: ms

Example:

```js
const keyId = 'you key id'
const { CiphertextBlob } = await kms.encrypt(keyId, { plaintext: 'plaintext' });
```

#### .decrypt(params, options)
Decrypt ciphertext

Parameters:

- params {Object} params for descrypt
  - ciphertext {String} ciphertext to decrypt
  - [context] {Object} decryption context
- [options] {Object} request options
  - timeout {Number} request timeout, Unit: ms

Example:

```js
const { Plaintext } = await kms.decrypt({ ciphertext: 'dadada' });
```

#### .generateDataKey(keyId, params, options)
Create a pair plain/cipher for encryption

Parameters:

- keyId {String} key id
- params {Object} generate date key params
  - keySpec {String} algorithm to encrypt/decrypt, AES_256 or AES_128
  - [length] {Number} encrypt key length
- [options] {Object} request options
  - timeout {Number} request timeout, Unit: ms

Example:

```js
const KEY_SPEC = require('kms').KEY_SPEC
const { Plaintext, CiphertextBlob } = await kms.generateDataKey('you key id'
  , { keySpec: KEY_SPEC.AES_256 });
```

#### .scheduleKeyDeletion(keyId, delayDays, options)
Delete key after delay days(7~30)

Parameters:

- keyId {String} key id
- delayDays {Number} delay days, min: 7, max: 30
- [options] {Object} request options
  - timeout {Number} request timeout, Unit: ms

Example:

```js
await kms.scheduleKeyDeletion('your key id', 7);
```

#### .cancelKeyDeletion(keyId, options)
Cancel schedule deletion

Parameters:

- keyId {String} key id
- [options] {Object} request options
  - timeout {Number} request timeout, Unit: ms

Example:

```js
await kms.cancelKeyDeletion('your key id');
```

#### .enableKey(keyId, options)
Enable disabled key

Parameters:

- keyId {String} key id
- [options] {Object} request options
  - timeout {Number} request timeout, Unit: ms

Example:

```js
await kms.enableKey('your key id');
```


#### .disableKey(keyId, options)
Disable key

Parameters:

- keyId {String} key id
- [options] {Object} request options
  - timeout {Number} request timeout, Unit: ms

Example:

```js
await kms.disableKey('your key id');
```

## License
----
MIT