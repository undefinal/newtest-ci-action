# Newtest Ci Action

An action that trigger newtest.

## Usage

```yaml
# 随机获取设备，连接远端优测真机，然后执行script脚本
- name: Newtest ci
  uses: undefinal/newtest-ci-action@docker
  env:
    secretId: xxx
    secretKey: xxx
    getDeviceBy: random #随机获取设备
    deviceNumber: 2 #设备数
    script: adb devices -l #应该显示出已连接的设备

# 按条件过滤获取设备，连接远端优测真机，然后执行script脚本
- name: Newtest ci
    uses: undefinal/newtest-ci-action@docker
    env:
      secretId: xxx
      secretKey: xxx
      getDeviceBy: condition #按条件获取设备
      brands: xxx 
      sdks: xxx
      resolutions: xxx
      ...
      aliases: xxx
      script: adb devices -l #应该显示出已连接的设备
```

### 参数说明
- getDeviceBy: condition 根据用户的筛选条件返回符合条件的设备

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

- getDeviceBy: condition 根据用户想要的获取数量，随机返回设备信息

|参数名|类型|必传|备注|
|-|-|-|-|
|deviceNumber|number|是|想要获取设备的数量|

