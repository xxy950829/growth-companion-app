# Project Context

This document provides AI assistants with project context to help quickly understand the project architecture, tech stack, and development conventions.

## Project Overview

**Project Name**: Growth Companion App
**Positioning**: A baby growth tracking app for young parents, featuring three core modules:
1. **Growth Archive** - Record baby milestones (first rollover, first "mama", height/weight, etc.)
2. **Growth Planet** - Habit task building, lighting up the planet by completing tasks (gamified design)
3. **Mood Weather Bottle** - Record baby's daily mood, using weather metaphors for emotional states

**Design Style**: Companion planet style, warm color palette (#FFF8F3 background, #FF8C5A primary color), rounded and friendly.

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | React Native + Expo SDK | 51 |
| Routing | Expo Router | 3.5 |
| Language | TypeScript (strict mode) | 5.3 |
| State Management | Zustand | 4.5 |
| Backend | Tencent CloudBase | js-sdk 2.28 |
| Local Storage | AsyncStorage + MMKV | - |
| Image Picker | expo-image-picker | 15.0 |
| File System | expo-file-system | 17.0 |

## Project Structure

```
growth-companion-app/
├── app/                    # Route pages (Expo Router file-based routing)
│   ├── _layout.tsx         # Root layout
│   ├── index.tsx           # Route dispatch (based on login state)
│   ├── onboarding.tsx      # Baby profile creation guide
│   ├── (auth)/             # Auth route group
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (tabs)/             # Main tab route group
│       ├── archive.tsx     # Growth Archive
│       ├── planet.tsx      # Growth Planet
│       ├── weather.tsx     # Mood Weather Bottle
│       └── profile.tsx     # User Profile
├── components/             # UI Components
│   ├── ui/                 # Base components (Button/Card/Input/Modal/Header)
│   ├── archive/            # Growth Archive components (MilestoneCard/Timeline/MilestoneForm)
│   ├── planet/             # Planet components (PlanetView/TaskItem/TaskForm)
│   └── weather/            # Weather Bottle components (WeatherBottle/MoodForm/MoodHistory)
├── services/               # Service layer (CloudBase integration)
│   ├── cloudbase.ts        # CloudBase SDK initialization
│   ├── auth.ts             # Auth service (dual mode: CloudBase + local)
│   ├── database.ts         # Database service (fine-grained CRUD API)
│   ├── storage.ts          # Storage service (image upload)
│   └── analytics.ts        # Analytics service (event tracking)
├── stores/                 # Zustand state management
│   ├── authStore.ts        # User auth state
│   ├── archiveStore.ts     # Growth Archive state
│   ├── planetStore.ts      # Planet task state
│   └── weatherStore.ts     # Mood Weather state
├── types/                  # TypeScript type definitions
│   ├── index.ts            # Common types (User/Baby)
│   ├── archive.ts          # Growth Archive types
│   ├── planet.ts           # Planet types (including PLANET_LEVELS config)
│   └── weather.ts          # Weather Bottle types (including WEATHER_CONFIG)
├── hooks/                  # Custom hooks
├── utils/                  # Utility functions
│   ├── constants.ts        # Constants (COLORS/STORAGE_KEYS/GENDER_CONFIG)
│   ├── helpers.ts          # Helper functions (generateId/formatDate/getTodayKey)
│   └── validators.ts       # Form validation
└── _shared/                # Shared resources (fonts/JS libraries)
```

## CloudBase Configuration

### Environment Info

- **Environment ID**: `hibiscus-1995-d4g2ysc4s44d440d1`
- **Region**: `ap-shanghai`
- **Access Token**: Configured in [services/cloudbase.ts](services/cloudbase.ts) (Publishable Key, can be public)

### Initialization Notes

1. **Must register RN adapter**: `cloudbase.useAdapters(adapter)` must be called before `init()`
2. **Must configure accessKey**: Required for anonymous access in RN environment
3. **File upload uses base64**: RN environment cannot use file paths directly, must read via `expo-file-system` as base64

### Database Collections

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| `users` | User profiles | `_id`(=auth uid), email, displayName |
| `babies` | Baby profiles | `_id`, userId, name, gender, birthday |
| `milestones` | Growth milestones | `_id`, babyId, type, date, description |
| `tasks` | Habit task definitions | `_id`, babyId, title, icon, isActive |
| `task_completions` | Task completion records | `_id`, babyId, taskId, date, completedAt |
| `planet_states` | Planet states | `_id`, babyId, level, stars, experience |
| `moods` | Mood records | `_id`, babyId, weather, temperature, date |

## Dual-Mode Architecture

The project uses a **CloudBase-first + local fallback** dual-mode architecture:

- **CloudBase Mode**: When `CLOUDBASE_ENABLED = true`, all data goes through the cloud
- **Local Mode**: When envId is not configured, automatically falls back to AsyncStorage local storage

All service functions handle both modes through `if (CLOUDBASE_ENABLED && db)` branching, ensuring development demos are always usable.

## Data Model Notes

### CloudBase Document Reading Convention

```typescript
// doc(id).get() returns a single document object (NOT an array)
const res = await db.collection('xxx').doc(id).get();
const data = res.data; // Object or null

// where().get() returns an array
const res = await db.collection('xxx').where({ babyId }).get();
const list = res.data; // Array
```

### Field Mapping

CloudBase documents contain internal fields `_id`, `_createTime`, `_updateTime`. When reading, strip and map these fields:

```typescript
const { _id, _createTime, _updateTime, ...rest } = doc;
return { ...rest, id: _id };
```

## Development Commands

```bash
# Start dev server
npm start

# Android build
npx expo export --platform android

# Type check
npx tsc --noEmit

# Install dependencies
npm install
```

## Known Issues and Notes

### 1. Expo SDK Version

- Currently using SDK 51, CloudBase RN adapter officially recommends SDK 52+
- Functions normally, but consider upgrading if compatibility issues arise

### 2. Captcha Handling

- CloudBase JS SDK v2 does not include `setCaptchaHandler` method
- Code uses `typeof` guard to prevent errors
- When frequent login failures trigger captcha, it may not display and needs manual handling

### 3. Babel Plugin

- Must keep `@babel/plugin-transform-class-static-block`, otherwise bson 4.x class static block syntax will cause build failures

### 4. Path Aliases

- Uses `@/*` to point to project root directory
- Must be configured in both `tsconfig.json` and `babel.config.js`

### 5. Sensitive Information

- `accessKey` is a Publishable Key, designed to be public (similar to Firebase API Key)
- For higher security, migrate to `app.json` `extra` field or environment variables

## Development Conventions

### Code Style

1. **Simplicity first**: No over-engineering, code should be self-explanatory
2. **Precise edits**: Only modify necessary parts, don't touch surrounding code unnecessarily
3. **English comments**: All comments in English (except proper nouns and code)
4. **Strict types**: TypeScript strict mode, avoid `any` (except for CloudBase SDK)

### File Organization

1. **Service layer**: All CloudBase calls encapsulated in `services/`, UI layer never calls SDK directly
2. **State management**: One store per module, store calls service, UI calls store
3. **Type definitions**: All data models defined in `types/`, shared across modules

### Commit Conventions

- Don't proactively create documentation files (*.md)
- Don't proactively commit code unless explicitly requested
- Don't proactively install dependencies unless the task requires it

## Key File Index

| File | Purpose |
|------|---------|
| [services/cloudbase.ts](services/cloudbase.ts) | CloudBase initialization config |
| [services/auth.ts](services/auth.ts) | Auth service (dual mode) |
| [services/database.ts](services/database.ts) | Database CRUD API |
| [services/storage.ts](services/storage.ts) | Image upload (base64) |
| [utils/constants.ts](utils/constants.ts) | Theme colors, storage keys, config constants |
| [types/planet.ts](types/planet.ts) | Planet level config (PLANET_LEVELS) |
| [types/weather.ts](types/weather.ts) | Weather config (WEATHER_CONFIG) |
| [development-plan.html](development-plan.html) | Original proposal document |
| [cloudbase开发指引.md](cloudbase开发指引.md) | CloudBase development guide |
| [初始化sdk.md](初始化sdk.md) | CloudBase initialization keys |
