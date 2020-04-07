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
    params: 
      brand:
        - oppo
      sdks:
        - 9
        - 10
      years:
        - 2019
        - 2018
```