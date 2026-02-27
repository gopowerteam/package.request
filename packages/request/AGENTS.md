<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-27 | Updated: 2026-02-27 -->

# @gopowerteam/request

## Purpose

Core HTTP request library implementing the adapter pattern for flexible HTTP client integration. Provides type-safe request handling with plugin middleware support, interceptors, and axios integration out of the box.

## Key Files

| File                            | Description                                                 |
| ------------------------------- | ----------------------------------------------------------- |
| `src/index.ts`                  | Barrel export for public API                                |
| `src/request-service.ts`        | Main service class handling request lifecycle               |
| `src/request-setup.ts`          | Configuration setup and initialization                      |
| `src/adapters/axios.adapter.ts` | Axios HTTP client adapter implementation                    |
| `src/adapters/index.ts`         | Adapter barrel export                                       |
| `src/interfaces/*.ts`           | Type definitions for adapters, plugins, setup, send options |

## Subdirectories

| Directory         | Purpose                                   |
| ----------------- | ----------------------------------------- |
| `src/interfaces/` | TypeScript interface definitions          |
| `src/adapters/`   | HTTP client adapter implementations       |
| `src/utils/`      | Utility functions (query-string handling) |
| `test/`           | Jest test files                           |

## For AI Agents

### Build Commands

```bash
# Build this package
pnpm --filter @gopowerteam/request build
# Or from this directory:
pnpm build

# Watch mode
pnpm --filter @gopowerteam/request dev
```

### Test Commands

```bash
# Run all tests
pnpm --filter @gopowerteam/request test

# Run single test file (from this directory)
pnpm jest test/path/to/file.spec.ts

# Run tests matching pattern
pnpm jest --testNamePattern="test name"

# Run tests with coverage
pnpm jest --coverage
```

### Lint Commands

```bash
pnpm --filter @gopowerteam/request lint
```

### Code Style

#### Imports

```typescript
import type { AxiosError, AxiosInstance } from 'axios'
// Use `import type` for type-only imports (IMPORTANT)
import type { RequestAdapter } from './interfaces/request-adapter.interface'

// External imports first, then internal
import axios from 'axios'
import * as qs from 'qs'
import { stringify } from './utils/query-string'
```

#### Naming Conventions

- **Classes**: PascalCase (`RequestService`, `AxiosAdapter`)
- **Interfaces**: PascalCase with descriptive names (`RequestAdapter`, `AdapterResponse`)
- **Methods**: camelCase (`execRequestPlugin`, `parseRequestPath`)
- **Private methods**: Use `private` keyword, no underscore prefix
- **Files**: kebab-case (`request-service.ts`, `request-adapter.interface.ts`)

#### Error Handling

```typescript
// Use Chinese error messages (project convention)
if (!RequestService.config) {
  throw new Error('请检查请求配置是否完成')
}
```

### Architecture Patterns

#### Adapter Pattern

Implement `RequestAdapter` interface for custom HTTP clients:

```typescript
interface RequestAdapter {
  injectConfig?: (config: RequestSetupConfig) => void
  request: (options: RequestAdapterOptions) => Promise<any>
  transformResponse: (response: any) => AdapterResponse
  transformException: (response: any) => AdapterResponse
}
```

#### Plugin System

Plugins hook into request lifecycle:

```typescript
interface RequestPlugin {
  before?: (options: RequestSendOptions, appendParams: Function) => Promise<void>
  after?: (response: AdapterResponse, options: RequestSendOptions) => void
  catch?: (response: AdapterResponse, options: RequestSendOptions) => void
}
```

#### Singleton Pattern

```typescript
export class RequestService {
  static config: RequestSetupConfig
  static instance: RequestService

  public static getInstance(): RequestService {
    if (this.instance)
      return this.instance
    return new RequestService()
  }
}
```

### Exports

Entry points defined in `tsup.config.ts`:

- `src/index.ts` → Main export
- `src/adapters/index.ts` → Adapters export

## Dependencies

### External

- **axios** - HTTP client
- **qs** - Query string parsing

### Dev Dependencies

- **jest** + **ts-jest** - Testing
- **tsup** - Bundler (ESM + CJS)
- **typescript** - v4.9.5

<!-- MANUAL: Custom project notes can be added below -->
