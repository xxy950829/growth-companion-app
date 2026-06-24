## 安装sdk
```js

npm i @cloudbase/js-sdk @cloudbase/adapter-rn
```


## 初始化sdk
```javascript


import cloudbaseSDK from "@cloudbase/js-sdk";
import adapter from "@cloudbase/adapter-rn";

cloudbaseSDK.useAdapters(adapter);

const cloudbase = cloudbaseSDK.init({
  // 环境 ID
  env: "",
  // 地域
  region: "",
  // 匿名访问令牌
  accessKey: ""
});

export default cloudbase;

```
