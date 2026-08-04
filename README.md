# Team6 Backend

Basic Node.js + Express API backend with a health endpoint.

## Complete Command List



```bash
git clone https://github.com/kainos-birmingham-academy-2026/team6-backend.git
cd team6-backend
npm install
npm run lint
npm run lint:fix
npm run dev
```

Then open:

```text
http://localhost:3000/health
```

Or check via terminal:

```bash
curl http://localhost:3000/health
```

To test the production-style build in a new terminal:

```bash
npm run build
npm run start
curl http://localhost:3000/health
```

Expected response includes:

```json
{
	"status": "UP",
	"time": "<current timestamp>"
}
```

## Prerequisites

- Node.js 18+ (Node.js 20+ recommended)
- npm

## Install

Run from the project root:

```bash
npm install
```

## Linting

Run lint checks:

```bash
npm run lint
```

Auto-fix lint issues where possible:

```bash
npm run lint:fix
```

## Run In Development (Hot Reload)

Start the API:

```bash
npm run dev
```

The server runs on port `3000` by default.

## Check Health Endpoint

Open this in your browser:

```text
http://localhost:3000/health
```

Or check in terminal:

```bash
curl http://localhost:3000/health
```

Expected JSON response shape:

```json
{
	"status": "UP",
	"time": "<current timestamp>"
}
```

## Build And Run From dist

Build output into `./dist`:

```bash
npm run build
```

Start the built app from `dist`:

```bash
npm run start
```

Then verify health again at:

```text
http://localhost:3000/health
```
