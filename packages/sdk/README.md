# @code-lense/sdk

> Programmatic TypeScript SDK for the Code Lense repository intelligence engine.

Use `@code-lense/sdk` to query repository symbols, scan project structures, search code using lexical and semantic hybrid ranking, and retrieve AI context directly in your Node.js or TypeScript applications.

## Installation

```bash
pnpm add @code-lense/sdk
# or
npm install @code-lense/sdk
```

## Usage

```typescript
import { CodeLense } from '@code-lense/sdk';

// Initialize SDK instance with repository root
const lens = new CodeLense({ rootDir: process.cwd() });

// Initialize database and storage
await lens.init();

// Index the repository
await lens.index();

// Search the repository
const results = await lens.search({
  query: 'database connection pooling',
  limit: 10,
});

console.log(results);
```

## License

MIT © Hisham
