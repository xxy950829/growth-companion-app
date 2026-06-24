# AGENT.md - 项目记忆文档

> 本文档为 AI 助手提供项目上下文，帮助快速理解项目架构、技术栈和开发约定。

## 项目概述

**项目名称**：成长伴侣（Growth Companion App）
**项目定位**：面向年轻父母的宝宝成长记录应用，包含三大核心模块：
1. **成长档案** - 记录宝宝里程碑（第一次翻身、第一次叫妈妈、身高体重等）
2. **成长小星球** - 习惯任务养成，通过完成任务点亮星球（游戏化设计）
3. **心情天气瓶** - 记录宝宝每日心情，用天气隐喻情绪状态

**设计风格**：童伴星球风格，暖色调（#FFF8F3 背景，#FF8C5A 主色），圆润友好。

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | React Native + Expo SDK | 51 |
| 路由 | Expo Router | 3.5 |
| 语言 | TypeScript（严格模式） | 5.3 |
| 状态管理 | Zustand | 4.5 |
| 后端 | 腾讯云开发 CloudBase | js-sdk 2.28 |
| 本地存储 | AsyncStorage + MMKV | - |
| 图片选择 | expo-image-picker | 15.0 |
| 文件系统 | expo-file-system | 17.0 |

## 项目结构

```
growth-companion-app/
├── app/                    # 路由页面（Expo Router 文件路由）
│   ├── _layout.tsx         # 根布局
│   ├── index.tsx           # 路由分发（根据登录状态）
│   ├── onboarding.tsx      # 宝宝档案创建引导
│   ├── (auth)/             # 认证路由组
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (tabs)/             # 主页 Tab 路由组
│       ├── archive.tsx     # 成长档案
│       ├── planet.tsx      # 成长小星球
│       ├── weather.tsx     # 心情天气瓶
│       └── profile.tsx     # 个人中心
├── components/             # UI 组件
│   ├── ui/                 # 基础组件（Button/Card/Input/Modal/Header）
│   ├── archive/            # 成长档案组件（MilestoneCard/Timeline/MilestoneForm）
│   ├── planet/             # 星球组件（PlanetView/TaskItem/TaskForm）
│   └── weather/            # 天气瓶组件（WeatherBottle/MoodForm/MoodHistory）
├── services/               # 服务层（CloudBase 集成）
│   ├── cloudbase.ts        # CloudBase SDK 初始化
│   ├── auth.ts             # 认证服务（双模式：CloudBase + 本地）
│   ├── database.ts         # 数据库服务（细粒度 CRUD API）
│   ├── storage.ts          # 存储服务（图片上传）
│   └── analytics.ts        # 分析服务（事件记录）
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
├── hooks/                  # 自定义 Hooks
├── utils/                  # 工具函数
│   ├── constants.ts        # 常量（COLORS/STORAGE_KEYS/GENDER_CONFIG）
│   ├── helpers.ts          # 辅助函数（generateId/formatDate/getTodayKey）
│   └── validators.ts       # 表单验证
└── _shared/                # 共享资源（字体/JS 库）
```

## CloudBase 配置

### 环境信息

- **环境 ID**：`hibiscus-1995-d4g2ysc4s44d440d1`
- **地域**：`ap-shanghai`
- **访问令牌**：已配置在 [services/cloudbase.ts](file:///c:/Users/Hibiscus/Desktop/trae创意大赛/growth-companion-app/services/cloudbase.ts)（Publishable Key，可公开）

### 初始化要点

1. **必须注册 RN 适配器**：`cloudbase.useAdapters(adapter)` 必须在 `init()` 之前调用
2. **必须配置 accessKey**：RN 环境下匿名访问必需
3. **文件上传用 base64**：RN 环境下无法直接用文件路径，需用 `expo-file-system` 读取为 base64

### 数据库集合

| 集合名 | 用途 | 关键字段 |
|--------|------|----------|
| `users` | 用户档案 | `_id`(=auth uid), email, displayName |
| `babies` | 宝宝档案 | `_id`, userId, name, gender, birthday |
| `milestones` | 成长里程碑 | `_id`, babyId, type, date, description |
| `tasks` | 习惯任务定义 | `_id`, babyId, title, icon, isActive |
| `task_completions` | 任务完成记录 | `_id`, babyId, taskId, date, completedAt |
| `planet_states` | 星球状态 | `_id`, babyId, level, stars, experience |
| `moods` | 心情记录 | `_id`, babyId, weather, temperature, date |

## 双模式架构

项目采用 **CloudBase 优先 + 本地回退** 的双模式架构：

- **CloudBase 模式**：`CLOUDBASE_ENABLED = true` 时，所有数据走云端
- **本地模式**：未配置 envId 时，自动回退到 AsyncStorage 本地存储

所有 service 函数通过 `if (CLOUDBASE_ENABLED && db)` 分支处理两种模式，保证开发演示可用。

## 数据模型要点

### CloudBase 文档读取约定

```typescript
// doc(id).get() 返回单个文档对象（不是数组）
const res = await db.collection('xxx').doc(id).get();
const data = res.data; // 对象或 null

// where().get() 返回数组
const res = await db.collection('xxx').where({ babyId }).get();
const list = res.data; // 数组
```

### 字段映射

CloudBase 文档包含内部字段 `_id`、`_createTime`、`_updateTime`，读取时需剥离并映射：

```typescript
const { _id, _createTime, _updateTime, ...rest } = doc;
return { ...rest, id: _id };
```

## 开发命令

```bash
# 启动开发服务器
npm start

# Android 构建
npx expo export --platform android

# 类型检查
npx tsc --noEmit

# 安装依赖
npm install
```

## 已知问题和注意事项

### 1. Expo SDK 版本

- 当前使用 SDK 51，CloudBase RN 适配器官方建议 SDK 52+
- 功能正常可用，但如遇兼容性问题可考虑升级

### 2. 验证码处理

- CloudBase JS SDK v2 不包含 `setCaptchaHandler` 方法
- 代码中用 `typeof` 保护，不会报错
- 频繁登录失败触发验证码时可能无法显示，需手动处理

### 3. Babel 插件

- 必须保留 `@babel/plugin-transform-class-static-block`，否则 bson 4.x 类静态块语法会导致构建失败

### 4. 路径别名

- 使用 `@/*` 指向项目根目录
- 在 `tsconfig.json` 和 `babel.config.js` 中同步配置

### 5. 敏感信息

- `accessKey` 是 Publishable Key，设计上可公开（类似 Firebase API Key）
- 如需更高安全性，可迁移到 `app.json` 的 `extra` 字段或环境变量

## 开发约定

### 代码风格

1. **简约至上**：不过度设计，代码一目了然
2. **精确编辑**：只修改必要部分，不随意改动周边代码
3. **中文注释**：所有注释使用中文（专有名称和代码除外）
4. **类型严格**：TypeScript 严格模式，避免 `any`（CloudBase SDK 除外）

### 文件组织

1. **服务层**：所有 CloudBase 调用封装在 `services/` 中，UI 层不直接调用 SDK
2. **状态管理**：每个模块一个 store，store 调用 service，UI 调用 store
3. **类型定义**：所有数据模型定义在 `types/` 中，跨模块共享

### 提交规范

- 不主动创建文档文件（*.md）
- 不主动提交代码，除非用户明确要求
- 不主动安装依赖，除非任务需要

## 关键文件索引

| 文件 | 作用 |
|------|------|
| [services/cloudbase.ts](file:///c:/Users/Hibiscus/Desktop/trae创意大赛/growth-companion-app/services/cloudbase.ts) | CloudBase 初始化配置 |
| [services/auth.ts](file:///c:/Users/Hibiscus/Desktop/trae创意大赛/growth-companion-app/services/auth.ts) | 认证服务（双模式） |
| [services/database.ts](file:///c:/Users/Hibiscus/Desktop/trae创意大赛/growth-companion-app/services/database.ts) | 数据库 CRUD API |
| [services/storage.ts](file:///c:/Users/Hibiscus/Desktop/trae创意大赛/growth-companion-app/services/storage.ts) | 图片上传（base64） |
| [utils/constants.ts](file:///c:/Users/Hibiscus/Desktop/trae创意大赛/growth-companion-app/utils/constants.ts) | 主题色、存储键、配置常量 |
| [types/planet.ts](file:///c:/Users/Hibiscus/Desktop/trae创意大赛/growth-companion-app/types/planet.ts) | 星球等级配置（PLANET_LEVELS） |
| [types/weather.ts](file:///c:/Users/Hibiscus/Desktop/trae创意大赛/growth-companion-app/types/weather.ts) | 天气配置（WEATHER_CONFIG） |
| [development-plan.html](file:///c:/Users/Hibiscus/Desktop/trae创意大赛/growth-companion-app/development-plan.html) | 原始方案文档 |
| [cloudbase开发指引.md](file:///c:/Users/Hibiscus/Desktop/trae创意大赛/growth-companion-app/cloudbase开发指引.md) | CloudBase 开发指引 |
| [初始化sdk.md](file:///c:/Users/Hibiscus/Desktop/trae创意大赛/growth-companion-app/初始化sdk.md) | CloudBase 初始化密钥 |
