# 项目上下文

> 本文档为 AI 助手提供项目上下文，帮助快速了解架构、技术栈和开发约定。

## 项目概述

**项目名称**：童伴星球 App
**项目定位**：面向年轻父母的宝宝成长记录应用，包含三个核心模块：
1. **成长档案** - 记录宝宝里程碑（第一次走路、身高体重、疫苗接种等）
2. **成长星球** - 习惯任务养成，完成任务点亮星球（游戏化设计）
3. **心情天气瓶** - 用天气隐喻记录宝宝每日心情

**设计风格**：陪伴星球风格，暖色调（#FFF8F3 背景、#FF8C5A 主色），圆润友好。

**后端服务**：[../growth-companion-server](file:///c:/Users/Hibiscus/Desktop/也要生活呀/trae创意大赛/growth-companion-server) - Node.js + Express + MySQL + 腾讯云 COS

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | React Native + Expo SDK | 54 |
| 路由 | Expo Router | 6.0 |
| 语言 | TypeScript（严格模式） | 5.9 |
| 状态管理 | Zustand | 4.5 |
| 后端通信 | axios | 1.18 |
| 本地存储 | AsyncStorage | - |
| 图片选择 | expo-image-picker | 17.0 |
| 文件系统 | expo-file-system | 19.0 |

## 项目结构

```
growth-companion-app/
├── app/                    # 路由页面（Expo Router 文件路由）
│   ├── _layout.tsx         # 根布局
│   ├── index.tsx           # 路由分发（基于登录状态）
│   ├── onboarding.tsx      # 宝宝档案创建引导
│   ├── (auth)/             # 认证路由组
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (tabs)/             # 主 Tab 路由组
│       ├── archive.tsx     # 成长档案
│       ├── planet.tsx      # 成长星球
│       ├── weather.tsx     # 心情天气瓶
│       └── profile.tsx     # 个人中心
├── components/             # UI 组件
│   ├── ui/                 # 基础组件（Button/Card/Input/Modal/Header/BabyAvatar）
│   ├── archive/            # 成长档案组件（MilestoneCard/Timeline/MilestoneForm）
│   ├── planet/             # 星球组件（PlanetView/TaskItem/TaskForm）
│   └── weather/            # 天气瓶组件（WeatherBottle/MoodForm/MoodHistory）
├── services/               # 服务层
│   ├── api.ts              # axios 客户端（自动 token 刷新）
│   ├── api-auth.ts         # REST 认证服务
│   ├── api-database.ts     # REST 数据库服务
│   ├── storage.ts          # 图片选择与上传（调后端 /api/upload）
│   └── analytics.ts        # 埋点服务（调后端 /api/analytics）
├── stores/                 # Zustand 状态管理
│   ├── authStore.ts        # 用户认证状态
│   ├── archiveStore.ts     # 成长档案状态
│   ├── planetStore.ts      # 星球任务状态
│   └── weatherStore.ts     # 心情天气状态
├── types/                  # TypeScript 类型定义
│   ├── index.ts            # 通用类型（User/Baby）
│   ├── archive.ts          # 成长档案类型
│   ├── planet.ts           # 星球类型（含 PLANET_LEVELS 配置）
│   └── weather.ts          # 天气瓶类型（含 WEATHER_CONFIG）
├── hooks/                  # 自定义 Hook
├── utils/                  # 工具函数
│   ├── constants.ts        # 常量（COLORS/STORAGE_KEYS/GENDER_CONFIG）
│   ├── helpers.ts          # 辅助函数（generateId/formatDate/getTodayKey）
│   └── validators.ts       # 表单校验
└── guide/                  # 原始需求文档
```

## 后端 API 集成

### 架构说明

项目通过自建后端服务（Node.js + Express + MySQL）提供 REST API。

- **通信方式**：通过 `services/api.ts`（axios 客户端）调用后端 REST API
- **认证机制**：JWT 双 token（access 2h + refresh 30d），axios 拦截器自动刷新
- **后端地址**：通过 `EXPO_PUBLIC_API_BASE_URL` 环境变量配置，默认 `http://localhost:3000/api`
- **文件上传**：前端 fetch + FormData 上传到后端 `/api/upload`，后端再上传到腾讯云 COS

### 服务层职责

| 文件 | 职责 |
|------|------|
| `services/api.ts` | axios 实例 + 请求拦截器（加 token）+ 响应拦截器（401 自动刷新） |
| `services/api-auth.ts` | 认证服务：register/login/logout/getCurrentUser/updateProfile |
| `services/api-database.ts` | 数据库服务：宝宝/里程碑/任务/星球/心情的 CRUD |
| `services/storage.ts` | 图片选择（expo-image-picker）+ 上传到后端 |
| `services/analytics.ts` | 埋点上报到后端 |

### Token 存储

| AsyncStorage Key | 用途 |
|---|---|
| `gc_access_token` | access token |
| `gc_refresh_token` | refresh token |
| `gc_user` | 用户信息缓存 |
| `gc_current_baby` | 当前选中的宝宝 id |

## 开发命令

```bash
# 启动开发服务器
npm start

# Android 构建
npx expo export --platform android

# 类型检查
npx tsc --noEmit

# 安装依赖（项目存在 peer dependency 冲突，必须用 --legacy-peer-deps）
npm install --legacy-peer-deps
```

## 已知问题和注意事项

### 1. Peer Dependency 冲突

- 项目存在 react 版本冲突（react@19.1.0 vs react-dom@19.2.7 peer 要求）
- 安装依赖时必须使用 `npm install --legacy-peer-deps`
- 不要删除 package-lock.json 后用普通 `npm install` 重装

### 2. 路径别名

- 使用 `@/*` 指向项目根目录
- 必须在 `tsconfig.json` 和 `babel.config.js` 中同时配置

### 3. 创建宝宝档案后未跳转主页

- 根因：`authStore.createBaby` 曾调用 `loadBabies()` 重新读取，后端读取延迟返回空数组，导致 `babies` 为空，`index.tsx` 路由分发时跳回 onboarding
- 修复：`createBaby` 改为基于当前 state 追加 `[...get().babies, baby]`；`onboarding.tsx` 创建成功后直接 `router.replace('/(tabs)/archive')`

### 4. 身高体重录入不显示 & 里程碑类型整合

- 根因：原 `height`/`weight` 为独立类型，`calcStats` 仅在 `type === 'weight'` 时取体重、`type === 'height'` 时取身高，导致身高页录入的体重丢失
- 修复：合并为单一 `measurement` 类型，表单同时录入身高体重；`calcStats` 改为基于字段统计（`m.height != null` 取值）
- 里程碑类型整合：`first_steps`（第一次走路）与 `first_words`（第一次说话）合并为 `first_milestone`（宝宝的第一次）
- 历史数据兼容：旧类型键仍保留在 `MILESTONE_TYPE_CONFIG`，通过 `isMeasurementType`/`isFirstMilestoneType` 辅助函数在筛选时匹配

### 5. VirtualizedList 嵌套 ScrollView 警告

- 根因：`Timeline` 和 `MoodHistory` 的 `FlatList` 嵌套在外层 `ScrollView` 内，React Native 不允许同向嵌套
- 修复：改为 `View` + `map` 渲染列表项，消除警告

### 6. 数据倒序排列

- 要求：最新数据排在最上面
- 修复：`archiveStore.load` 和 `weatherStore.load` 加载后强制按 `date` 倒序排列（`sort((a, b) => b.date - a.date)`）；`addMilestone`/`addMood` 新增记录用 `[record, ...list]` 置顶

### 7. 宝宝头像上传与切换弹框优化

- 头像：`Baby.avatarUrl` 字段支持，`onboarding.tsx` 添加圆形头像选择区（拍照/相册）；`components/ui/BabyAvatar.tsx` 组件复用头像显示逻辑
- 切换宝宝：移除事后通知，改为直接切换（卡片有"当前"徽章和高亮反馈）
- 设置入口：`profile.tsx` 数据概览标题行右侧新增 ⚙️ 设置按钮，点击右侧滑出抽屉

### 8. 后端迁移（CloudBase -> 自建 REST API）

- 背景：CloudBase 匿名用户对云存储网关权限默认拒绝，accessKey JWT 签名问题无法代码层修复
- 方案：新建 `growth-companion-server` 后端项目（Express + MySQL + 腾讯云 COS）
- 前端改动：
  1. `services/api.ts`：axios 客户端 + 拦截器自动刷新 token
  2. `services/api-auth.ts`：REST 认证服务
  3. `services/api-database.ts`：REST 数据库服务
  4. 4 个 store 的 import 改为 `api-database` 和 `api-auth`
  5. `storage.ts` 改为 fetch + FormData 上传到后端 `/api/upload`
  6. `analytics.ts` 改为调后端 `/api/analytics`
- 彻底清理：已删除 `cloudbase.ts`/`auth.ts`/`database.ts`/`polyfill.ts`/`entry.js`/`shims/`，移除 `@cloudbase/*`、`react-native-mmkv`、`react-native-get-random-values`、`@babel/plugin-transform-class-static-block` 依赖，`package.json` main 改回 `expo-router/entry`

## 开发约定

### 代码风格

1. **简约至上**：不过度设计，代码自解释
2. **精确编辑**：只修改必要部分，不随意修改旁边代码
3. **中文注释**：所有注释用中文（除专有名词和代码语法）
4. **严格类型**：TypeScript 严格模式，避免 `any`

### 文件组织

1. **服务层**：所有后端调用封装在 `services/`；UI 层不直接调 axios
2. **状态管理**：每个模块一个 store；store 调 service，UI 调 store
3. **类型定义**：所有数据模型定义在 `types/`；跨模块共享

### 提交约定

- 不主动创建文档文件（*.md）
- 不主动提交代码，除非用户明确要求
- 不主动安装依赖，除非任务需要

## 关键文件索引

| 文件 | 用途 |
|------|------|
| [services/api.ts](file:///c:/Users/Hibiscus/Desktop/也要生活呀/trae创意大赛/growth-companion-app/services/api.ts) | axios 客户端（自动 token 刷新） |
| [services/api-auth.ts](file:///c:/Users/Hibiscus/Desktop/也要生活呀/trae创意大赛/growth-companion-app/services/api-auth.ts) | REST 认证服务 |
| [services/api-database.ts](file:///c:/Users/Hibiscus/Desktop/也要生活呀/trae创意大赛/growth-companion-app/services/api-database.ts) | REST 数据库服务 |
| [services/storage.ts](file:///c:/Users/Hibiscus/Desktop/也要生活呀/trae创意大赛/growth-companion-app/services/storage.ts) | 图片选择与上传 |
| [services/analytics.ts](file:///c:/Users/Hibiscus/Desktop/也要生活呀/trae创意大赛/growth-companion-app/services/analytics.ts) | 埋点服务 |
| [utils/constants.ts](file:///c:/Users/Hibiscus/Desktop/也要生活呀/trae创意大赛/growth-companion-app/utils/constants.ts) | 主题色、存储键、配置常量 |
| [types/planet.ts](file:///c:/Users/Hibiscus/Desktop/也要生活呀/trae创意大赛/growth-companion-app/types/planet.ts) | 星球等级配置（PLANET_LEVELS） |
| [types/weather.ts](file:///c:/Users/Hibiscus/Desktop/也要生活呀/trae创意大赛/growth-companion-app/types/weather.ts) | 天气配置（WEATHER_CONFIG） |
