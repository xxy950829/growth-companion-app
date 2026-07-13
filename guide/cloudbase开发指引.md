# 适配器开发指引

@cloudbase/js-sdk 只支持常规 Web 应用（即浏览器环境）的开发，不兼容其他类 Web 平台，比如微信小程序、快应用、Cocos 等。虽然这些平台大多支持 JavaScript 运行环境，但在网络请求、本地存储、平台标识等特性上与浏览器环境有明显差异。针对这些差异特性，@cloudbase/js-sdk 提供一套完整的适配扩展方案，遵循此方案规范可开发对应平台的适配器，然后搭配 @cloudbase/js-sdk 和适配器实现平台的兼容性。

## 适配规范

开发适配器之前需要安装官方提供的接口声明模块[`@cloudbase/adapter-interface`](https://www.npmjs.com/package/@cloudbase/adapter-interface)：

```bash
# npm
npm i @cloudbase/adapter-interface
# yarn
yarn add @cloudbase/adapter-interface
```

适配器模块需要导出一个`adapter`对象：

```js
const adapter = {
  genAdapter,
  isMatch,
  // runtime标记平台唯一性
  runtime: '平台名称'
};

export adapter;
export default adapter;
```

必须包含以下三个字段：

- `runtime`: `string`，平台的名称，用于标记平台唯一性；
- `isMatch`: `Function`，判断当前运行环境是否为平台，返回`boolean`值；
- `genAdapter`: `Function`，创建`adapter`实体。

### runtime

`runtime`用于标记平台的唯一性，建议尽量以平台的英文名称或简写命名，比如百度小程序`baidu_miniapp`、QQ 小程序`qq_miniapp`等等。

### isMatch

`isMatch`函数用于判断当前运行环境是否与适配器匹配，通常是通过判断平台特有的一些全局变量、API 等。比如以下代码是判断运行环境是否为 Cocos 原生平台：

```js
function isMatch(): boolean {
  if (typeof cc === "undefined") {
    return false;
  }
  if (typeof WebSocket === "undefined") {
    return false;
  }
  if (typeof XMLHttpRequest === "undefined") {
    return false;
  }

  if (!cc.game) {
    return false;
  }
  if (typeof cc.game.on !== "function") {
    return false;
  }
  if (!cc.game.EVENT_HIDE) {
    return false;
  }
  if (!cc.game.EVENT_SHOW) {
    return false;
  }

  if (!cc.sys) {
    return false;
  }
  if (!cc.sys.isNative) {
    return false;
  }

  return true;
}
```

### genAdapter

`genAdapter`函数返回适配器的实体对象，结构如下：

```typescript
interface SDKAdapterInterface {
  // 全局根变量，浏览器环境为window
  root: any;
  // WebSocket类
  wsClass: WebSocketContructor;
  // request类
  reqClass: SDKRequestConstructor;
  // 无localstorage时persistence=local降级为none
  localStorage?: StorageInterface;
  // 无sessionStorage时persistence=session降级为none
  sessionStorage?: StorageInterface;
  // storage模式首选，优先级高于persistence
  primaryStorage?: StorageType;
  // Captcha验证码配置
  captchaOptions?: {
    // 打开网页并通过URL回调获取 CaptchaToken，针对不同的平台，该函数可以自定义实现
    openURIWithCallback?: (url: string) => Promise<CaptchaToken>;
  };
  // 获取平台唯一应用标识的api
  getAppSign?(): string;
}
```

### 示例

```typescript
import {
  AbstractSDKRequest,
  IRequestOptions,
  IUploadRequestOptions,
  StorageInterface,
  WebSocketInterface,
  WebSocketContructor,
  SDKAdapterInterface,
  StorageType,
  formatUrl,
} from "@cloudbase/adapter-interface";

// isMatch函数判断当前平台是否匹配
function isMatch(): boolean {
  // ...
  return true;
}

// Request类为平台特有的网络请求，必须实现post/upload/download三个public接口
export class Request extends AbstractSDKRequest {
  // 实现post接口
  public post(options: IRequestOptions) {
    return new Promise((resolve) => {
      // ...
      resolve();
    });
  }
  // 实现upload接口
  public upload(options: IUploadRequestOptions) {
    return new Promise((resolve) => {
      // ...
      resolve();
    });
  }
  // 实现download接口
  public download(options: IRequestOptions) {
    return new Promise((resolve) => {
      // ...
      resolve();
    });
  }
}
// Storage为平台特有的本地存储，必须实现setItem/getItem/removeItem/clear四个接口
export const Storage: StorageInterface = {
  setItem(key: string, value: any) {
    // ...
  },
  getItem(key: string): any {
    // ...
  },
  removeItem(key: string) {
    // ...
  },
  clear() {
    // ...
  },
};
// WebSocket为平台特有的WebSocket，与HTML5标准规范一致
export class WebSocket {
  constructor(url: string, options: object = {}) {
    const socketTask: WebSocketInterface = {
      set onopen(cb) {
        // ...
      },
      set onmessage(cb) {
        // ...
      },
      set onclose(cb) {
        // ...
      },
      set onerror(cb) {
        // ...
      },
      send: (data) => {
        // ...
      },
      close: (code?: number, reason?: string) => {
        // ...
      },
      get readyState() {
        // ...
        return readyState;
      },
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3,
    };
    return socketTask;
  }
}

// genAdapter函数创建adapter实体
// options 为 cloudbase.useAdapters(adapter, options) 时传入的参数
function genAdapter(options) {
  const adapter: SDKAdapterInterface = {
    // root对象为全局根对象，没有则填空对象{}
    root: window,
    reqClass: Request,
    wsClass: WebSocket as WebSocketContructor,
    localStorage: Storage,
    // 首先缓存存放策略，建议始终保持localstorage
    primaryStorage: StorageType.local,
    // sessionStorage为可选项，如果平台不支持可不填
    sessionStorage: sessionStorage,
  };
  return adapter;
}

// 三者缺一不可
const adapter = {
  genAdapter,
  isMatch,
  // runtime标记平台唯一性
  runtime: "平台名称",
};

export default adapter;
```

## 接入流程

### 第 1 步：安装并引入适配器

安装 @cloudbase/js-sdk 和所需平台的适配器，比如 QQ 小游戏平台：

```bash
# 安装 @cloudbase/js-sdk
npm i @cloudbase/js-sdk
# 安装 QQ 小游戏适配器
npm i cloudbase-adapter-qq_game
```

然后在业务代码中将引入适配器：

```js
import cloudbase from "@cloudbase/js-sdk";
import adapter from "cloudbase-adapter-qq_game";

// options传入后，可以在 adapter 的 genAdapter 中获取到该参数
cloudbase.useAdapters(adapter, options);
```

### 第 2 步：初始化云开发

在业务代码中初始化云开发

```js
import cloudbase from '@cloudbase/js-sdk';
import adapter from 'cloudbase-adapter-qq_game';

cloudbase.useAdapters(adapter);

cloudbase.init({
  env: '环境ID',
})
```

## 一套代码多端适配

:::tip Web 和小程序无需配置
@cloudbase/js-sdk 已经内置了 Web 端和小程序端的 adapter，在这两个平台下无需配置即可使用。
:::

如果您需要将一套代码兼容多种平台，@cloudbase/js-sdk 可以同时引入多个适配器，在运行时通过各适配器的`isMatch`函数判断平台类型，然后引入对应的兼容逻辑。比如以下代码可以同时兼容 QQ 小游戏、 Cocos 原生和百度小游戏三种平台：

```js
import cloudbase from '@cloudbase/js-sdk';
import adapter as adapterOfQQGame from 'cloudbase-adapter-qq_game';
import adapter as adapterOfCocosNative from 'cloudbase-adapter-cocos_native';
import adapter as adapterOfBDGame from 'cloudbase-adapter-bd_game';

cloudbase.useAdapters([
  adapterOfQQGame,
  adapterOfCocosNative,
  adapterOfBDGame
]);
```

## 验证码处理指南

### 1、概述

详细说明了处理验证码的完整流程，包括验证码触发场景、适配器改造、事件处理和用户交互。

### 2、验证码触发场景

验证码会在以下情况被要求输入：

- 用户名密码登录失败 5 次后
- 发送手机号或邮箱验证码时达到频率限制

> 需要验证码时，接口会返回如下错误信息

```typescript
{
  // ...
  data: {
    error: "captcha_required",
    error_code: 4001,
    error_description: "captcha_token required"
  }
}

```

### 3、完整处理流程

#### 适配器(Adapter)改造

```typescript
// options 通过 useAdapters 第二参数传入
// 例如：cloudbase.useAdapters(adapter, options);
function genAdapter(options) {
  const adapter: SDKAdapterInterface = {
    // 其他适配器配置...

    captchaOptions: {
      // 当检测到需要验证码时，自动触发此函数
      // url 为包含验证码图片、token、state等参数的字符串
      openURIWithCallback: async (url: string) => {
        // 解析URL中的验证码参数
        const { captchaData, state, token } = cloudbase.parseCaptcha(url);

        // 通过事件总线发送验证码数据，进行前端缓存及展示
        options.EVENT_BUS.emit("CAPTCHA_DATA_CHANGE", {
          captchaData, // Base64编码的验证码图片
          state, // 验证码状态标识
          token, // 验证码token
        });

        // 监听验证码校验结果
        return new Promise((resolve) => {
          console.log("等待验证码校验结果...");
          options.EVENT_BUS.once("RESOLVE_CAPTCHA_DATA", (res) => {
            // auth.verifyCaptchaData的校验结果
            resolve(res);
          });
        });
      },
    },
  };
  return adapter;
}
```

#### 初始化与适配器配置

```typescript
// 创建事件总线实例
const EVENT_BUS = new EventBus();

// 配置并使用适配器，将 EVENT_BUS 注入给 genAdapter
cloudbase.useAdapters(adapter, { EVENT_BUS });
const app = cloudbase.init({
  env: '环境ID',
  appSign: '应用标识',
  appSecret: {
    appAccessKeyId: '应用凭证版本号'
    appAccessKey: '应用凭证'
  }
});
const auth = app.auth();
```

#### 验证码界面实现

```typescript
// 存储当前验证码状态
let captchaState = {
  captchaData: "", // Base64编码的验证码图片
  state: "", // 验证码状态标识
  token: "", // 验证码token
};

// 监听验证码数据变化
EVENT_BUS.on("CAPTCHA_DATA_CHANGE", ({ captchaData, state, token }) => {
  console.log("收到验证码数据", { captchaData, state, token });

  // 更新本地验证码状态
  captchaState = { captchaData, state, token };

  // 在页面中显示验证码图片，例如在web使用img标签展示方式如下
  document.getElementById('captcha-image').src = captchaData;
});

// 用户点击刷新验证码，触发该函数
const refreshCaptcha = async () => {
  try {
    // 获取最新验证码信息
    const result = await auth.createCaptchaData({ state: captchaState.state });

    // 更新本地验证码状态
    captchaState = {
      ...captchaState
      captchaData: result.data,
      token: result.token,
    };

    // 更新显示的验证码，例如在web使用img标签展示方式如下
    document.getElementById('captcha-image').src = result.data;
  } catch (error) {
    console.error("刷新验证码失败", error);
  }
};

// 用户提交验证码，触发该函数
const verifyCaptchaData = async (userCaptcha) => {
  try {
    // 校验验证码
    const verifyResult = await auth.verifyCaptchaData({
      token: captchaState.token,
      key: userCaptcha
    });

    // 将校验结果通知适配器
    EVENT_BUS.emit("RESOLVE_CAPTCHA_DATA", verifyResult);

    // 验证成功，继续登录流程
    console.log("验证码校验成功");
  } catch (error) {
    console.error("验证码校验失败", error);
    // 可以选择刷新验证码
    await refreshCaptcha()
  }
};
```

#### 完整流程

1. 用户尝试登录或发送验证码
2. 若触发验证码要求，SDK 抛出 captcha_required 错误
3. 适配器捕获错误并调用 openURIWithCallback
4. 系统解析验证码参数并通过 EVENT_BUS 发送
5. 前端展示验证码图片并等待用户输入
6. 用户输入验证码并提交
7. 系统验证并返回结果
8. 根据验证结果决定是否重试原操作

#### 验证码展示效果

<img src="https://qcloudimg.tencent-cloud.cn/raw/665f9e387c6f43cce176e1f0b6c1d428.png" width='300px' />

---
source: https://docs.cloudbase.net/api-reference/webv2/adapter





# React Native 适配器

## 概览

React Native 适配器是云开发为 React Native / Expo 框架提供的专用适配器，让开发者能够在 React Native 项目中无缝使用云开发的完整功能。通过该适配器，您可以轻松实现移动端的云端数据存储、用户认证、文件管理和云函数调用等。

### 支持平台

目前已适配以下平台：

- iOS 13+
- Android 6+

### 环境要求

- Node.js >= 18
- React Native 0.76+
- Expo SDK 52+

## 效果展示

完整示例项目请参考：[CloudBase React Native Demo](https://github.com/TencentCloudBase/awesome-cloudbase-examples/tree/master/universal/cloudbase-rn-demo)

<p>
<img src="https://qcloudimg.tencent-cloud.cn/raw/fe0407737582175f2f92920c531dd8a8.png" width="24%" />
<img src="https://qcloudimg.tencent-cloud.cn/raw/b820a53cb02e98f621349ca85a0730eb.png" width="24%" />
<img src="https://qcloudimg.tencent-cloud.cn/raw/287fdca11601a747cc450d7831f048e3.jpg" width="24%" />
<img src="https://qcloudimg.tencent-cloud.cn/raw/b7c8a89eb5d5420d1d95c57240eff3ed.jpg" width="24%" />
</p>

## 安装

使用 npm 安装：

```bash
npm install @cloudbase/js-sdk @cloudbase/adapter-rn react-native-mmkv
```

:::tip 注意
`react-native-mmkv` 用于高性能持久化存储，建议使用 v3.x 版本，v4.x 需要 NitroModules 配置较复杂。
:::

### iOS 原生依赖

```bash
cd ios && pod install && cd ..
```

## 快速开始

### 适配器配置

```typescript
import cloudbase from "@cloudbase/js-sdk";
import adapter from "@cloudbase/adapter-rn";

// 注册适配器
cloudbase.useAdapters(adapter);

const app = cloudbase.init({
  env: "your-env-id", // 替换为您的环境 ID
  region: "ap-shanghai", // 地域
  accekey: "your-app-access-key", // Publishable Key
});

export default app;
```

:::warning 重要提示

`adapter` 必须在 `cloudbase.init()` 之前调用
:::

## 图形验证码机制说明

在某些安全敏感的操作场景下（如用户登录），腾讯云开发会要求进行图形验证码验证。适配器内部已集成验证码处理流程：

```typescript
captchaOptions: {
  openURIWithCallback: async (url: string): Promise<CaptchaToken> => {
    const urlObj = new URL(url);
    const captchaData = urlObj.searchParams.get("captcha_data") || "";
    const state = urlObj.searchParams.get("state") || "";
    const token = urlObj.searchParams.get("token") || "";

    return new Promise((resolve) => {
      if (captchaHandler) {
        captchaHandler({ captchaData, state, token, resolve });
      } else {
        console.warn("No captcha handler registered");
        resolve({ error: "no_handler" } as any);
      }
    });
  },
}
```

开发者需注册验证码处理器，参考 [图形验证码处理流程](https://docs.cloudbase.net/api-reference/webv2/adapter/#3%E5%AE%8C%E6%95%B4%E5%A4%84%E7%90%86%E6%B5%81%E7%A8%8B)：

```typescript
import { setCaptchaHandler } from "@cloudbase/adapter-rn";

setCaptchaHandler(async ({ captchaData, state, token, resolve }) => {
  // 显示 captchaData (Base64编码的验证码图片) 给用户
  // 用户输入验证码后调用 verifyCaptchaData 校验
  const captchaToken = await auth.verifyCaptchaData({
    token,
    key: "user-input-captcha-key",
  });
  resolve(captchaToken);
});
```

## 项目结构

## 主要依赖

| 依赖                                                                         | 版本    | 说明                |
| ---------------------------------------------------------------------------- | ------- | ------------------- |
| @cloudbase/js-sdk                                                            | ^2.24.9 | 腾讯云开发 SDK      |
| [@cloudbase/adapter-rn](https://www.npmjs.com/package/@cloudbase/adapter-rn) | ^1.0.0  | React Native 适配器 |
| react-native-mmkv                                                            | ^3.3.3  | 高性能持久化存储    |

## 常见问题

### Q: 为什么要在 init 之前调用 useAdapters？

A: 适配器需要在 SDK 初始化之前注册，以确保 SDK 能够正确识别当前运行环境并使用相应的适配器。

### Q: 为什么推荐使用 react-native-mmkv v3.x？

A: v4.x 版本需要 NitroModules 配置，配置较为复杂。v3.x 版本配置简单，性能稳定。

### Q: 文件上传为什么需要使用 base64 编码？

A: React Native 环境下，文件系统访问与 Web 环境不同，使用 base64 编码是最兼容的方式。上传时需设置 `contentEncoding: 'base64'`。

## 相关资源

- [CloudBase 官方文档](https://docs.cloudbase.net/)
- [@cloudbase/adapter-rn NPM 包](https://www.npmjs.com/package/@cloudbase/adapter-rn)
- [React Native 官方文档](https://reactnative.dev/)

---
source: https://docs.cloudbase.net/api-reference/webv2/adapter/rn-adapter
