# Newtest Ci Action

An action that trigger newtest.

## Usage

```yaml
- name: Newtest ci
  uses: undefinal/newtest-ci-action@master
  with:
    secretId: xxx
    secretKey: xxx
    type: devices
    paramStr: {"brands":["oppo"],"years":[2019],"sdks":[9]}
```

### 参数说明

- type: open,release,devices,devicesNum四种之一
- paramStr: jsonstring格式

详细说明

- type: open 

|参数名|类型|必传|备注|
|-|-|-|-|
|uuids|array|**是**|需要开通手机的uuid数组|
|maxMIn|number|**是**|手机开启adb超时时间(分)，超出改时间后设备将被强制释放|

- type: release 释放adb接口 

|参数名|类型|必传|备注|
|-|-|-|-|
|uuids|array|**是**|需要开通手机的uuid数组|

- type: devices 根据用户的筛选条件返回符合条件的设备

|参数名|类型|必传|备注|
|-|-|-|-|
|brands|array|否|设备的品牌|
|sdks|array|否|设备的sdk|
|resolutions|array|否|设备的分辨率|
|cpus|array|否|设备的cpu|
|years|array|否|设备的生产日期|
|models|array|否|设备的机型信息|
|uuids|array|否|设备的uuid(用于精确查询)|
|aliases|array|否|设备的别名|

- type: devicesNum 根据用户想要的获取数量，随机返回设备信息

|参数名|类型|必传|备注|
|-|-|-|-|
|deviceNumber|number|是|想要获取设备的数量|

