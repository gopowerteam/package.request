<!-- Generated: 2026-02-27 | Updated: 2026-02-27 -->

# package.request

## Purpose

A TypeScript monorepo containing HTTP request utilities and OpenAPI code generation tools. Built with Turborepo and pnpm workspaces, providing type-safe request handling (`@gopowerteam/request`) and automatic code generation from Swagger/OpenAPI specs (`@gopowerteam/request-generate`).

## Key Files

| File                   | Description                                     |
| ---------------------- | ----------------------------------------------- |
| `package.json`         | Root package manifest with workspace scripts    |
| `pnpm-workspace.yaml`  | PNPM monorepo workspace configuration           |
| `turbo.json`           | Turborepo task pipeline configuration           |
| `eslint.config.mjs`    | ESLint flat config using @antfu/eslint-config   |
| `.editorconfig`        | Editor formatting settings (2-space indent, LF) |
| `.lintstagedrc.js`     | Lint-staged configuration for pre-commit hooks  |
| `commitlint.config.js` | Commit message linting rules                    |
| `.cz-config.js`        | Commitizen interactive commit configuration     |

## Subdirectories

| Directory                    | Purpose                                          |
| ---------------------------- | ------------------------------------------------ |
| `packages/request/`          | Core HTTP request library with adapter pattern   |
| `packages/request-generate/` | OpenAPI/Swagger code generator CLI tool          |
| `playground/`                | Test environments and generated service examples |
| `.changeset/`                | Changeset configuration for versioning           |
| `.husky/`                    | Git hooks for pre-commit and commit-msg          |

## For AI Agents

### Build Commands

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @gopowerteam/request build
pnpm --filter @gopowerteam/request-generate build

# Development watch mode
pnpm dev
pnpm --filter @gopowerteam/request dev
```

### Lint Commands

```bash
# Lint all packages
pnpm lint

# Lint specific package
pnpm --filter @gopowerteam/request lint
```

### Test Commands

```bash
# Run all tests in request package
pnpm --filter @gopowerteam/request test

# Run single test file
cd packages/request && pnpm jest test/path/to/file.spec.ts

# Run tests matching pattern
cd packages/request && pnpm jest --testNamePattern="test name"

# Run tests with coverage
cd packages/request && pnpm jest --coverage
```

### Package-specific Commands

Use `--filter` to target specific packages:

```bash
pnpm --filter @gopowerteam/request <command>
pnpm --filter @gopowerteam/request-generate <command>
```

### Code Style Guidelines

#### Imports

```typescript
// Use `import type` for type-only imports
import type { RequestAdapter } from "./interfaces";
import type { RequestPlugin } from "./interfaces/request-plugin.interface";

// Group imports: external first, then internal
import { PluginLifecycle } from "./interfaces/request-plugin.interface";
import { stringify } from "./utils/query-string";
```

#### TypeScript Configuration

- Strict mode enabled (`strict: true`)
- `noUnusedLocals: true` - No unused local variables
- `noUnusedParameters: true` - No unused parameters
- `noImplicitReturns: true` - Explicit returns required
- Target: ESNext, Module: ESNext

#### Naming Conventions

- **Classes**: PascalCase (e.g., `RequestService`, `RequestSetupConfig`)
- **Interfaces**: PascalCase with descriptive names (e.g., `RequestAdapter`, `RequestPlugin`)
- **Methods**: camelCase (e.g., `execRequestPlugin`, `parseRequestPath`)
- **Private methods**: Prefix with underscore not required, use `private` keyword
- **Constants**: camelCase for objects, UPPER_SNAKE_CASE for true constants
- **Files**: kebab-case (e.g., `request-service.ts`, `request-setup.interface.ts`)

#### Formatting

- Indentation: 2 spaces
- Line endings: LF
- Semicolons: As per @antfu/eslint-config (typically no semicolons)
- Quotes: Single quotes preferred
- Trailing commas: ES5 compatible

#### Error Handling

```typescript
// Throw descriptive errors in Chinese for this codebase
if (!RequestService.config) {
  throw new Error("请检查请求配置是否完成");
}

// Use try-catch for async operations
const response = await this.startRequest(adapter, options, extraParams)
  .then((response) => adapter.transformResponse(response))
  .catch((exception) => {
    hasException = true;
    return adapter.transformException(exception);
  });
```

#### Class Patterns

```typescript
// Singleton pattern with static instance
export class RequestService {
  static config: RequestSetupConfig;
  static instance: RequestService;

  public static getInstance(): RequestService {
    if (this.instance) {
      return this.instance;
    }
    return new RequestService();
  }
}
```

#### Export Patterns

```typescript
// Barrel exports in index.ts
export * from "./interfaces";
export * from "./request-service";
export * from "./request-setup";

// Named exports for utilities
export const generate = Generate.startup;
export const download = Download.startup;
```

### Commit Conventions

This project uses Commitizen with custom types:

| Type       | Description              |
| ---------- | ------------------------ |
| `feat`     | New feature              |
| `fix`      | Bug fix                  |
| `docs`     | Documentation update     |
| `refactor` | Code refactoring         |
| `perf`     | Performance optimization |
| `test`     | Adding/updating tests    |
| `build`    | Build system changes     |
| `revert`   | Revert changes           |

Use `pnpm commit` for interactive commit creation.

### Testing Requirements

- Tests use Jest with ts-jest preset
- Test environment: Node.js
- Place test files in `test/` directory adjacent to `src/`
- Run tests before committing changes

### Common Patterns

#### Adapter Pattern

The request library uses adapters for different HTTP clients:

```typescript
interface RequestAdapter {
  request(options: RequestOptions): Promise<AdapterResponse>;
  transformResponse(response: any): AdapterResponse;
  transformException(exception: any): AdapterResponse;
}
```

#### Plugin System

Middleware-style plugins for request/response lifecycle:

```typescript
interface RequestPlugin {
  before?(options: RequestSendOptions, appendParams: Function): Promise<void>;
  after?(response: AdapterResponse, options: RequestSendOptions): void;
  catch?(response: AdapterResponse, options: RequestSendOptions): void;
}
```

### Pre-commit Hooks

Husky runs lint-staged on commit:

- ESLint auto-fix on `.ts` and `.tsx` files
- Commitlint validates commit messages

## Dependencies

### External

- **axios** - HTTP client (request package)
- **@apidevtools/swagger-parser** - OpenAPI parsing (generate package)
- **handlebars** - Template engine for code generation
- **rxjs** - Reactive programming utilities
- **commander** - CLI framework

### Build Tools

- **tsup** - TypeScript bundler (ESM + CJS output)
- **turbo** - Monorepo build orchestration
- **pnpm** - Package manager (v9.10.0)
- **TypeScript** - v4.9.5

### Dev Tools

- **@antfu/eslint-config** - ESLint preset
- **Jest** + **ts-jest** - Testing framework
- **Husky** + **lint-staged** - Git hooks

<!-- MANUAL: Custom project notes can be added below -->
