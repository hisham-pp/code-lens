# Installation & Quickstart

Get up and running with **Code Lense** in under two minutes.

---

## 1. System Requirements

Before installing Code Lense, make sure your environment meets the following requirements:

| Component            | Minimum                  | Recommended       | Notes                                                 |
| -------------------- | ------------------------ | ----------------- | ----------------------------------------------------- |
| **Node.js**          | `>= 20.0.0`              | `22.x` or `24.x`  | Node 22+ includes native `node:sqlite` engine support |
| **Operating System** | Linux, macOS, Windows    | Linux or macOS    | Native SQLite and POSIX paths fully supported         |
| **Git**              | `2.x+`                   | Latest            | Required on `PATH` for Git repository intelligence    |
| **Package Manager**  | `npm`, `pnpm`, or `yarn` | `pnpm` (`>= 9.0`) | Recommended for fast monorepo workspace management    |

---

## 2. Installation Options

### Option A: Global CLI Installation

Install the `code-lense` command line binary globally so it is available from any terminal session:

```bash
# Using npm
npm install -g code-lense

# Using pnpm
pnpm add -g code-lense

# Using yarn
yarn global add code-lense
```

Verify your installation:

```bash
code-lense --version
```

---

### Option B: Local Project devDependency

Add Code Lense directly to your project repository so your entire team or CI pipeline can run it with a pinned version:

```bash
# In your project root:
pnpm add -D code-lense
# or
npm install --save-dev code-lense
```

Run via `npx` or `pnpm exec`:

```bash
pnpm exec code-lense doctor
```

---

### Option C: TypeScript SDK for Applications

If you are building an AI assistant, an IDE plugin, a code review bot, or an internal developer platform, install the programmatic SDK:

```bash
pnpm add @code-lense/sdk
# or
npm install @code-lense/sdk
```

---

### Option D: Build from Source (Monorepo)

To contribute to Code Lense or build the latest cutting-edge code:

```bash
# 1. Clone the repository
git clone https://github.com/hisham-pp/code-lens.git
cd code-lens

# 2. Install monorepo dependencies
pnpm install

# 3. Build all workspace packages
pnpm build

# 4. Link CLI globally (optional)
npm link ./packages/cli
```

---

## 3. Environment Health Check (`code-lense doctor`)

Code Lense comes equipped with a built-in diagnostic suite to guarantee your environment has all necessary capabilities before indexing begins:

```bash
code-lense doctor
```

Sample output:

```text
[15:10:12.120] [INFO]    [doctor] Running Code Lense environment diagnostics...
[15:10:12.122] [SUCCESS] [doctor] Node.js Version: v22.13.5 (Supported: >=20.0.0)
[15:10:12.130] [SUCCESS] [doctor] Git Executable: git version 2.43.0
[15:10:12.140] [SUCCESS] [doctor] SQLite Database: Engine OK (Driver: node:sqlite)
[15:10:12.145] [SUCCESS] [doctor] SQLite FTS5: Full-Text Search Enabled
[15:10:12.152] [SUCCESS] [doctor] Vector Storage: Float32Array SIMD BLOB Support OK
[15:10:12.155] [SUCCESS] [doctor] Storage Directory: /home/user/.code-lense (Read/Write OK)
[15:10:12.156] [SUCCESS] [doctor] All diagnostic checks passed! System is ready.
```

### What `doctor` Verifies:

1. **Node.js Runtime**: Confirms Node version $\ge 20.0.0$.
2. **Git Executable**: Validates Git is installed, on `PATH`, and responding to subprocess calls.
3. **SQLite Driver**: Verifies the SQLite database driver operates in memory.
4. **FTS5 Virtual Tables**: Tests compilation of SQLite Full-Text Search version 5 for BM25 lexical ranking.
5. **Vector BLOB Capability**: Verifies IEEE 754 Float32Array buffer allocation and cosine distance calculations.
6. **Storage Permissions**: Tests directory creation and atomic read/write permissions at `~/.code-lense`.

---

## 4. First-Time Quickstart Workflow

Run through these five simple steps in any repository to explore its intelligence:

### Step 1: Initialize Configuration

```bash
cd /path/to/your/repository
code-lense init
```

_Creates `.repolensconfig` (engine settings) and `.repolensignore` (custom file ignores)._

### Step 2: Index the Repository

```bash
code-lense index
```

_Scans files, parses symbols, splits AST chunks, updates Git tracking, and populates SQLite FTS5._

### Step 3: View Repository Intelligence Dashboard

```bash
code-lense status
```

_Displays file count, AST symbol counts, languages breakdown bars, and current Git status._

### Step 4: Perform a Multi-Signal Hybrid Search

```bash
code-lense search "UserService" --mode hybrid --limit 5
```

_Executes hybrid search combining lexical BM25 and vector cosine distance with formatted code snippets._

### Step 5: Ask a Question

```bash
code-lense ask "Where is user authentication handled?"
```

_Synthesizes context from AST symbols, dependency graph, and Git changes to provide an answer with exact source citations._
