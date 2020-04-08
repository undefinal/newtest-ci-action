const request = require('request');
const uuid = require('uuid');
const crypto = require('crypto');
const exec = require('child_process').exec;

const urlOpen = 'https://newtest.21kunpeng.com:18074/jyx-paas-provider-remote/InsideSecret/adb/openAdb';
const urlRelease = 'https://newtest.21kunpeng.com:18074/jyx-paas-provider-remote/InsideSecret/adb/releaseAdb';
const urlDevices = 'https://newtest.21kunpeng.com:18074/jyx-paas-provider-remote/deviceInfo/InsideSecret/adb/getDeviceByConditions';
const urlDevicesNum = 'https://newtest.21kunpeng.com:18074/jyx-paas-provider-remote/deviceInfo/InsideSecret/adb/randomGetDevice';

const paramObj = process.env;
const secretId = paramObj.secretId;
const secretKey = paramObj.secretKey;

async function newtestRequest() {
  const getDeviceBy = paramObj.getDeviceBy;
  if (!secretId || !secretKey || !getDeviceBy) {
    console.error('please set secretId,secretKey,getDeviceBy')
    return;
  }
  const param = {
    secretId: secretId,
    signMethod: 'SHA256'
  };

  let uuids = [];
  if (getDeviceBy == 'random') {
    if (!paramObj.deviceNumber) {
      console.error('no deviceNumber');
      return;
    }
    const getDeviceParam = Object.assign({}, param);
    getDeviceParam.signTime = Date.now();
    getDeviceParam.signNonce = uuid.v1();
    getDeviceParam.deviceNumber = paramObj.deviceNumber;
    const result = await getDevice(getDeviceParam, getDeviceBy);
    if (result.code !== 0) {
      console.error(result.msg)
      process.exit(1);
    }
    uuids = result.data;
  } else if (getDeviceBy == 'condition') {
    const getDeviceParam = Object.assign({}, param);
    getDeviceParam.signTime = Date.now();
    getDeviceParam.signNonce = uuid.v1();
    try {
      paramObj.brands && (getDeviceParam.brands = JSON.parse(paramObj.brands));
      paramObj.sdks && (getDeviceParam.sdks = JSON.parse(paramObj.sdks));
      paramObj.resolutions && (getDeviceParam.resolutions = JSON.parse(paramObj.resolutions));
      paramObj.cpus && (getDeviceParam.cpus = JSON.parse(paramObj.cpus));
      paramObj.years && (getDeviceParam.years = JSON.parse(paramObj.years));
      paramObj.models && (getDeviceParam.models = JSON.parse(paramObj.models));
      paramObj.uuids && (getDeviceParam.uuids = JSON.parse(paramObj.uuids));
      paramObj.aliases && (getDeviceParam.aliases = JSON.parse(paramObj.aliases));
    } catch (error) {
      console.error('getDeviceParam', error)
      process.exit(1);
    }
    const result = await getDevice(getDeviceParam, getDeviceBy);
    if (result.code !== 0) {
      console.error(result.msg)
      process.exit(1);
    }
    uuids = result.data;
  } else {
    console.error('getDeviceBy should be random or condition')
    return;
  }
  const openParam = Object.assign({}, param);
  openParam.signTime = Date.now();
  openParam.signNonce = uuid.v1();
  openParam.uuids = uuids;
  openParam.maxMin = '1';
  const rst = await openAdb(openParam);
  if (rst.code !== 0) {
    console.error(rst.msg)
    process.exit(1);
  }
  rst.data.forEach(item => {
    exec(`adb connect utest.21kunpeng.com:${item.data}`, async (err, stdout, stderr) => {
      console.error('adb connect', err, stdout, stderr)
      if (err) {
        const releaseParam = Object.assign({}, param);
        releaseParam.signTime = Date.now();
        releaseParam.signNonce = uuid.v1();
        releaseParam.uuids = uuids;
        const rst = await releaseAdb(releaseParam);
        console.error('release result', rst);
        return;
      }
      exec(paramObj.script, async (err, stdout, stderr) => {
        console.error('script', err, stdout, stderr)
        const releaseParam = Object.assign({}, param);
        releaseParam.signTime = Date.now();
        releaseParam.signNonce = uuid.v1();
        releaseParam.uuids = uuids;
        const rst = await releaseAdb(releaseParam);
        console.error('release result', rst);
      })
    })
  })
}

function getDevice(param, type) {
  let url = urlDevices;
  if (type == 'random') {
    url = urlDevicesNum
  }
  return new Promise(resolve => {
    resolve({
      code: 0,
      data: ['AEEBC219ED43672A130DC7EE78FA6FA0',
      'F2D5B09AA51EFE6EEF539952ED6CADBB']
    });
    return;
    param = handleParam(param);
    console.log('getDevice',param)
    request(url, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Authorization': secretId,
        'token': secretId
      },
      body: JSON.stringify(param)
    }, (error, response) => {
      if (error) {
        console.error('getDevice', error);
        resolve({
          code: -1,
          msg: error.message
        });
        return;
      }
      const rsp = response.toJSON();
      console.error('getDevice', rsp.body);
      if (rsp.statusCode !== 200) {
        resolve({
          code: -1,
          msg: `getDevice error: ${rsp.statusCode} ${rsp.body}`
        });
      } else {
        let body = rsp.body;
        try {
          body = JSON.parse(body);
        } catch (error) {
          resolve({
            code: -1,
            msg: `parse body error:${error.message}`
          });
        }
        if (body.code === 200) {
          const rst = body.result;
          if (rst.state == 22222222) {
            const data = rst.data;
            if (data && data.length > 0) {
              let uuids = [];
              data.forEach(item => {
                uuids.push(item.uuid);
              });
              resolve({
                code: 0,
                data: uuids
              });
            } else {
              resolve({
                code: -1,
                msg: `getDevice error: no data`
              });
            }
          } else {
            resolve({
              code: -1,
              msg: `getDevice error: ${rst.state} ${rst.message}`
            });
          }
        } else {
          resolve({
            code: -1,
            msg: `getDevice error: ${rsp.body}`
          });
        }
      }
    })
  })
}

function openAdb(param) {
  return new Promise(resolve => {
    param = handleParam(param);
    console.log('openAdb',param)
    request(urlOpen, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Authorization': secretId,
        'token': secretId
      },
      body: JSON.stringify(param)
    }, (error, response) => {
      if (error) {
        console.error('openAdb', error);
        resolve({
          code: -1,
          msg: error.message
        });
        return;
      }
      const rsp = response.toJSON();
      console.error('openAdb', rsp.body);
      if (rsp.statusCode !== 200) {
        resolve({
          code: -1,
          msg: `openAdb error: ${rsp.statusCode} ${rsp.body}`
        });
      } else {
        let body = rsp.body;
        try {
          body = JSON.parse(body);
        } catch (error) {
          resolve({
            code: -1,
            msg: `parse body error:${error.message}`
          });
        }
        if (body.code === 200) {
          const rst = body.result;
          if (rst.state == 22222222) {
            const data = rst.data;
            if (data && data.length > 0) {
              let uuids = [];
              let erruuids = [];
              data.forEach(item => {
                if (item.rc == 0) {
                  uuids.push(item)
                } else {
                  erruuids.push(item)
                }
              });
              if (uuids.length > 0) {
                resolve({
                  code: 0,
                  data: uuids,
                  erruuids
                });
              } else {
                resolve({
                  code: -1,
                  erruuids
                });
              }
            } else {
              resolve({
                code: -1,
                msg: `openAdb error: no data`
              });
            }
          } else {
            resolve({
              code: -1,
              msg: `openAdb error: ${rst.state} ${rst.message}`
            });
          }
        } else {
          resolve({
            code: -1,
            msg: `openAdb error: ${rsp.body}`
          });
        }
      }
    })
  })
}

function releaseAdb(param) {
  return new Promise(resolve => {
    param = handleParam(param);
    console.log('releaseAdb',param)
    request(urlRelease, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Authorization': secretId,
        'token': secretId
      },
      body: JSON.stringify(param)
    }, (error, response) => {
      if (error) {
        console.error('releaseAdb', error);
        resolve({
          code: -1,
          msg: error.message
        });
        return;
      }
      const rsp = response.toJSON();
      console.error('releaseAdb', rsp.body);
      if (rsp.statusCode !== 200) {
        resolve({
          code: -1,
          msg: `openAdb error: ${rsp.statusCode} ${rsp.body}`
        });
      } else {
        let body = rsp.body;
        try {
          body = JSON.parse(body);
        } catch (error) {
          resolve({
            code: -1,
            msg: `parse body error:${error.message}`
          });
        }
        if (body.code === 200) {
          const rst = body.result;
          if (rst.state == 22222222) {
            const data = rst.data;
            if (data && data.length > 0) {
              let uuids = [];
              let erruuids = [];
              data.forEach(item => {
                if (item.rc == 0) {
                  uuids.push(item)
                } else {
                  erruuids.push(item)
                }
              });
              if (uuids.length > 0) {
                resolve({
                  code: 0,
                  data: uuids,
                  erruuids
                });
              } else {
                resolve({
                  code: -1,
                  msg
                });
              }
            } else {
              resolve({
                code: -1,
                msg: `releaseAdb error: no data`
              });
            }
          } else {
            resolve({
              code: -1,
              msg: `releaseAdb error: ${rst.state} ${rst.message}`
            });
          }
        } else {
          resolve({
            code: -1,
            msg: `releaseAdb error: ${rsp.body}`
          });
        }
      }
    })
  })
}

function handleParam(config) {
  let str = '';

  function sortObj(old) {
    var newObj = {};
    Object.keys(old).sort().forEach(function (k) {
      newObj[k] = old[k]
    });
    return newObj;
  }
  let param = sortObj(config);
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
  return param;
}
newtestRequest()