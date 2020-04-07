const request = require('request');
const uuid = require('uuid');
const crypto = require('crypto');
const core = require("@actions/core")

const secretId = core.getInput("secretId", {
  required: true
});
const secretKey = core.getInput("secretKey", {
  required: true
});
const urlOpen = 'https://newtest.21kunpeng.com:18074/jyx-paas-provider-remote/InsideSecret/adb/openAdb';
const urlRevease = 'https://newtest.21kunpeng.com:18074/jyx-paas-provider-remote/InsideSecret/adb/releaseAdb';
const urlDevices = 'https://newtest.21kunpeng.com:18074/jyx-paas-provider-remote/deviceInfo/InsideSecret/adb/getDeviceByConditions';
const urlDevicesNum = 'https://newtest.21kunpeng.com:18074/jyx-paas-provider-remote/deviceInfo/InsideSecret/adb/randomGetDevice';

function newtestRequest() {
  const type = core.getInput("type", {
    required: true
  });
  const paramStr = core.getInput("paramStr");
  const signTime = Date.now();
  let url = '';
  switch (type) {
    case 'open':
      url = urlOpen;
      break;
    case 'release':
      url = urlRevease;
      break;
    case 'devices':
      url = urlDevices;
      break;
    case 'devicesNum':
      url = urlDevicesNum;
      break;
  }
  if (!url) {
    const msg = 'please set the type of [open,release,devices,devicesNum]';
    console.error(msg);
    core.setFailed(msg);
    return;
  }
  let str = '';
  let param = {
    secretId: secretId,
    signTime: signTime,
    sigNonce: uuid.v1(),
    signMethod: 'SHA256'
  };
  let paramObj;
  try {
    paramObj = JSON.parse(paramStr)
  } catch (error) {
    core.setFailed(error.message);
    return;
  }
  if (type === 'open') {
    if(!paramObj.uuids){
      core.setFailed('no uuids');
      return;
    }
    param.uuids = paramObj.uuids;
    paramObj.maxMin && (param.maxMin = paramObj.maxMin);
  } else if (type === 'release') {
    if(!paramObj.uuids){
      core.setFailed('no uuids');
      return;
    }
    param.uuids = paramObj.uuids;
  } else if (type === 'devicesNum') {
    if(!paramObj.deviceNumber){
      core.setFailed('no devicesNum');
      return;
    }
    param.deviceNumber = paramObj.deviceNumber;
  } else if (type === 'devicesNum') {
    paramObj.brands && (param.brands = paramObj.brands);
    paramObj.sdks && (param.sdks = paramObj.sdks);
    paramObj.resolutions && (param.resolutions = paramObj.resolutions);
    paramObj.cpus && (param.cpus = paramObj.cpus);
    paramObj.years && (param.years = paramObj.years);
    paramObj.models && (param.models = paramObj.models);
    paramObj.uuids && (param.uuids = paramObj.uuids);
    paramObj.aliases && (param.aliases = paramObj.aliases);
  }


  function sortObj(old) {
    var newObj = {};
    Object.keys(old).sort().forEach(function (k) {
      newObj[k] = old[k]
    });
    return newObj;
  }
  param = sortObj(param);
  for (let key in param) {
    if (typeof param[key] !== 'object') {
      str += `${key}=${param[key]}`;
    } else {
      str += `${key}=${JSON.stringify(param[key])}`;
    }
    str += '&';
  }
  str += `secretKey=${secretKey}`;
  param.sign = crypto.createHash('SHA256').update(str).digest('hex');
  param = sortObj(param);
  console.error(JSON.stringify(param))
  request(urlDevices, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'Authorization': secretId,
      'token': secretId
    },
    body: JSON.stringify(param)
  }, (error, response) => {
    console.error(error, response.toJSON())
    if (error) {
      console.error(error);
      core.setFailed(error.message);
      return;
    }
    const rsp = response.toJSON()
    if (rsp.statusCode !== 200) {
      core.setFailed(rsp.body);
    } else {
      core.setOutput("response", rsp.body);
    }
  })
}
newtestRequest()