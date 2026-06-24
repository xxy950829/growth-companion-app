# 项目启动与操作指南

> 本指南详细介绍如何搭建开发环境、启动项目、进行开发调试以及构建发布。

## 一、环境准备

### 1.1 必需软件

| 软件 | 最低版本 | 说明 |
|------|----------|------|
| **Node.js** | 18.x LTS | 推荐使用 LTS 版本，[下载地址](https://nodejs.org/) |
| **npm** | 9.x+ | 随 Node.js 一同安装 |
| **Git** | 2.x+ | 版本管理，[下载地址](https://git-scm.com/) |
| **Android Studio** | 最新稳定版 | Android 模拟器（可选） |
| **Xcode** | 15+ | iOS 模拟器，仅 macOS（可选） |

### 1.2 推荐工具（可选）

- **VS Code / Trae IDE**：代码编辑器
- **Expo Go App**：真机调试用，从应用商店下载

### 1.3 环境验证

在终端中运行以下命令，确认环境就绪：

```powershell
# 检查 Node.js 版本
node --version
# 预期输出：v18.x.x 或更高

# 检查 npm 版本
npm --version
# 预期输出：9.x.x 或更高
```

---

## 二、项目安装

### 2.1 克隆项目（首次）

```powershell
# 进入目标目录
cd "C:\Users\Hibiscus\Desktop\trae创意大赛"

# 如果项目尚未克隆，从 Git 仓库拉取
# git clone <仓库地址> growth-companion-app
```

### 2.2 安装依赖

```powershell
# 进入项目根目录
cd "C:\Users\Hibiscus\Desktop\trae创意大赛\growth-companion-app"

# 安装所有依赖（首次或 node_modules 丢失时执行）
npm install
```

> **提示**：如果安装过程中遇到网络问题，可尝试使用淘宝镜像：
> ```powershell
> npm config set registry https://registry.npmmirror.com
> npm install
> ```

### 2.3 依赖安装完成标志

安装成功后，项目根目录会出现 `node_modules` 文件夹，终端无红色错误输出。

---

## 三、启动项目

### 3.1 启动开发服务器

```powershell
# 进入项目根目录
cd "C:\Users\Hibiscus\Desktop\trae创意大赛\growth-companion-app"

# 启动 Expo 开发服务器
npm start
```

启动后终端会显示 QR 码和菜单选项：

```
  Press a │ open Android
  Press i │ open iOS simulator
  Press w │ open web
```

### 3.2 选择运行平台

#### 方式 A：直接指定平台启动

```powershell
# Android 模拟器
npm run android

# iOS 模拟器（仅 macOS）
npm run ios

# Web 浏览器
npm run web
```

#### 方式 B：通过菜单交互选择

启动 `npm start` 后，在终端中按对应按键：
- 按 `a` → 启动 Android 模拟器
- 按 `i` → 启动 iOS 模拟器
- 按 `w` → 启动 Web 浏览器

#### 方式 C：使用 Expo Go 真机调试

1. 在手机上安装 **Expo Go** App
   - Android：Google Play 搜索 "Expo Go"
   - iOS：App Store 搜索 "Expo Go"
2. 确保手机和电脑在同一 WiFi 网络下
3. 用 Expo Go 扫描终端中的 QR 码即可运行

---

## 四、开发调试

### 4.1 TypeScript 类型检查

```powershell
# 运行类型检查（无输出 = 通过）
npm run typecheck

# 或直接调用 tsc
npx tsc --noEmit
```

- 退出码 0：全部通过
- 有输出：根据错误信息修复代码

### 4.2 热重载

项目已启用 Expo 热重载（Fast Refresh），修改代码后自动刷新：
- 保存文件 → 自动更新界面
- 修改组件样式 → 即时生效
- 修改逻辑代码 → 自动重新渲染

手动刷新：在终端按 `r` 键重启应用。

### 4.3 开发者菜单

在模拟器中打开开发者菜单：
- **Android**：`Ctrl + M` 或摇晃设备
- **iOS**：`Cmd + D` 或摇晃设备
- **Web**：浏览器开发者工具

菜单功能：
- Reload：重新加载应用
- Debug with Chrome：用 Chrome 调试
- Show Performance Monitor：显示性能监控

### 4.4 日志查看

```powershell
# 启动时日志会直接输出到终端
# 也可以在浏览器 DevTools Console 中查看 Web 平台日志
```

---

## 五、项目结构速览

```
growth-companion-app/
├── app/                    # 页面路由（Expo Router）
│   ├── _layout.tsx         # 根布局
│   ├── index.tsx           # 路由分发（根据登录状态跳转）
│   ├── onboarding.tsx      # 创建宝宝档案引导页
│   ├── (auth)/             # 登录注册页
│   └── (tabs)/             # 主页四个 Tab
│       ├── archive.tsx     # 成长档案
│       ├── planet.tsx      # 成长星球
│       ├── weather.tsx     # 心情天气瓶
│       └── profile.tsx     # 个人中心
├── components/             # UI 组件
├── services/               # 服务层（CloudBase 集成）
├── stores/                 # 状态管理（Zustand）
├── types/                  # TypeScript 类型定义
├── hooks/                  # 自定义 Hooks
├── utils/                  # 工具函数和常量
├── assets/                 # 静态资源（图片等）
├── _shared/                # 共享资源（字体、JS 库）
├── app.json                # Expo 配置
├── package.json            # 项目依赖
├── tsconfig.json           # TypeScript 配置
└── babel.config.js         # Babel 配置（含路径别名）
```

---

## 六、常见问题排查

### 6.1 `npm install` 失败

**症状**：依赖安装报错或卡住

**解决**：
```powershell
# 清除缓存后重试
npm cache clean --force
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### 6.2 启动时报端口占用

**症状**：`Error: listen EADDRINUSE: address already in use :::8081`

**解决**：
```powershell
# 方式 1：使用其他端口
npx expo start --port 8082

# 方式 2：关闭占用端口的进程
netstat -ano | findstr :8081
# 找到 PID 后
taskkill /PID <进程ID> /F
```

### 6.3 Android 模拟器无法连接

**症状**：Metro Bundler 运行但模拟器无法加载

**解决**：
```powershell
# 确保模拟器已启动，然后执行
adb reverse tcp:8081 tcp:8081
```

### 6.4 模块找不到错误

**症状**：`Cannot find module '@/xxx'`

**原因**：路径别名未生效

**解决**：确认 `tsconfig.json` 和 `babel.config.js` 中均已配置 `@/*` 别名（项目已预配置，通常不会遇到）。

### 6.5 CloudBase 未连接

**症状**：数据未同步到云端，仅本地存储

**说明**：这是正常行为。项目采用"双模式架构"：
- **CloudBase 已配置**：数据同步到腾讯云
- **CloudBase 未配置**：自动回退到本地 AsyncStorage 存储

本地模式完全可用，适合开发调试。

---

## 七、构建发布

### 7.1 导出 Android 构建

```powershell
npx expo export --platform android
```

### 7.2 生成原生项目（如需自定义原生代码）

```powershell
npx expo prebuild --platform android
npx expo prebuild --platform ios
```

### 7.3 EAS 云构建（推荐）

```powershell
# 安装 EAS CLI
npm install -g eas-cli

# 登录 Expo 账号
eas login

# 配置构建
eas build:configure

# 执行构建
eas build --platform android
eas build --platform ios
```

---

## 八、常用命令速查

| 命令 | 说明 |
|------|------|
| `npm start` | 启动开发服务器（交互式） |
| `npm run android` | 直接启动 Android |
| `npm run ios` | 直接启动 iOS（仅 macOS） |
| `npm run web` | 直接启动 Web |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm install` | 安装/更新依赖 |
| `npx expo start --clear` | 清除缓存并启动 |
| `npx expo export --platform android` | 导出 Android 构建产物 |
