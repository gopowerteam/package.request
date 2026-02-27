<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-27 | Updated: 2026-02-27 -->

# @gopowerteam/request-generate

## Purpose

CLI tool for generating TypeScript service code from OpenAPI/Swagger specifications. Parses v2 and v3 OpenAPI documents and produces type-safe service classes, models, and request methods using Handlebars templates.

## Key Files

| File                       | Description                                       |
| -------------------------- | ------------------------------------------------- |
| `src/index.ts`             | Public API exports (generate, download functions) |
| `src/generate/index.ts`    | Main generation orchestrator                      |
| `src/download/index.ts`    | Swagger document download logic                   |
| `src/define-config.ts`     | Configuration definition helper                   |
| `src/template.ts`          | Handlebars template registration                  |
| `src/vite-plugin/index.ts` | Vite plugin for dev-time generation               |
| `bin/generate.mts`         | CLI entry for generate command                    |
| `bin/download.mts`         | CLI entry for download command                    |

## Subdirectories

| Directory               | Purpose                                        |
| ----------------------- | ---------------------------------------------- |
| `src/parse/v2/`         | OpenAPI v2 document parsers                    |
| `src/parse/v3/`         | OpenAPI v3 document parsers                    |
| `src/generate/`         | File writing and code generation               |
| `src/entities/`         | Data models (Service, Operation, Model, Field) |
| `src/utils/`            | Utility functions (naming, type mapping)       |
| `src/types/`            | TypeScript type definitions                    |
| `src/template-helpers/` | Handlebars helper functions                    |
| `src/templates/`        | Handlebars template files (copied to dist)     |
| `src/config/`           | Configuration enums                            |
| `test/`                 | Jest test files                                |

## For AI Agents

### Build Commands

```bash
# Build this package
pnpm --filter @gopowerteam/request-generate build
# Or from this directory:
pnpm build

# Watch mode
pnpm --filter @gopowerteam/request-generate dev
```

### Test Commands

```bash
# Run all tests
pnpm --filter @gopowerteam/request-generate test

# Run single test file (from this directory)
pnpm jest test/path/to/file.spec.ts

# Run tests matching pattern
pnpm jest --testNamePattern="test name"
```

### Lint Commands

```bash
pnpm --filter @gopowerteam/request-generate lint
```

### CLI Usage

```bash
# Generate services from OpenAPI spec
request-generate --input <url-or-file> --output <directory>

# Download OpenAPI document
request-download --url <swagger-url> --output <file>
```

### Code Style

#### Imports

```typescript
// Use `import type` for type-only imports
import type { OpenAPIV2, OpenAPIV3 } from "openapi-types";
import type { GenerateOptions } from "../types/generate-options";

// Node.js built-ins with `node:` prefix
import process from "node:process";
```

#### Naming Conventions

- **Classes**: PascalCase (`Generate`, `Download`)
- **Functions**: camelCase (`parseV2`, `parseV3`, `getOpenApiDocument`)
- **Files**: kebab-case (`parse-service.ts`, `write-models.ts`)
- **Utils**: `get-*` prefix for getters (`getServiceName`, `getOperationName`)

#### Error Handling

```typescript
// Use Chinese error messages for user-facing output
console.error(`请求文件[${input}]失败,请稍后重试.`);
process.exit(0);
```

### Architecture Patterns

#### Parser Pattern (v2/v3)

Separate parsers for OpenAPI versions:

```typescript
// src/parse/v3/index.ts
export function parseV3(document: OpenAPIV3.Document): GenerateClient {
  // Parse services, models, operations
}
```

#### Entity Classes

Data models in `src/entities/`:

- `Service` - API service definition
- `Operation` - HTTP operation (GET, POST, etc.)
- `Model` - TypeScript interface/model
- `Field` - Model property
- `OperationParameter` - Request parameter

#### Template System

Handlebars templates in `src/templates/` with helpers in `src/template-helpers/`:

- `equal.helper.ts` - Equality check
- `is-array.helper.ts` - Array type check
- `to-upper.helper.ts` - String uppercasing
- `include-query-params.ts` - Query param inclusion

#### Vite Plugin

```typescript
// Integration with Vite build
export function requestGeneratePlugin(options: PluginOptions): Plugin;
```

### Exports

Entry points (tsup.config.ts):

- `src/index.ts` → Main library
- `src/vite-plugin/index.ts` → Vite plugin

Output: ESM + CJS with d.ts declarations

## Dependencies

### External

- **@apidevtools/swagger-parser** - OpenAPI parsing
- **handlebars** - Template engine
- **commander** - CLI framework
- **chalk** - Terminal colors
- **ora** - Progress spinners
- **rxjs** - Reactive utilities
- **qs** - Query string handling

### Internal

- **@gopowerteam/request** - Request library (workspace)

### Dev Dependencies

- **vite** - For plugin testing
- **jest** + **ts-jest** - Testing
- **tsup** - Bundler
- **typescript** - v4.9.5

<!-- MANUAL: Custom project notes can be added below -->
