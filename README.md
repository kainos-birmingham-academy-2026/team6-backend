# team6-backend

Backend service for Team 6 built with Express, TypeScript, and Vitest.

## Requirements

- Node.js 20 or later
- npm 10 or later

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the backend in development mode:

```bash
npm run dev
```

3. Open the health endpoint in your browser or with curl:

```bash
curl http://localhost:3000/health
```

## Scripts

- `npm run dev` - start the backend with hot reload
- `npm run build` - compile the TypeScript source into `dist/`
- `npm start` - run the compiled backend from `dist/index.js`
- `npm run test` - run the Vitest unit tests
- `npm run test:coverage` - run the tests and generate coverage output
- `npm run test:ui` - placeholder for UI tests; this repository is backend-only
- `npm run lint` - check code style with Biome
- `npm run lint:fix` - automatically fix lint issues with Biome

## Test Endpoint

The service exposes a simple health route:

- `GET /health`

Response example:

```json
{
  "status": "UP",
  "timestamp": "2026-08-05T09:38:09.000Z"
}
```

## Notes For Reviewers

- The app is split into a testable factory in `src/app.ts` and a server entrypoint in `src/index.ts`.
- Unit tests live in `tests/health.test.ts`.
- Coverage output is ignored in `.gitignore`.
