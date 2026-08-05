# team6-backend

Backend service for Team 6 built with Express, TypeScript, and Vitest.

## Requirements

- Node.js 20 or later
- npm 10 or later
- Docker

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start PostgreSQL in Docker on port `5433`:

```bash
docker run --name jobs-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=job-roles -p 5433:5432 -d postgres
```

3. Install Prisma packages if you do not already have them:

```bash
npm install prisma@6 --save-dev
npm install @prisma/client@6
```

4. Create a `.env` file in the project root and add:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5433/job-roles"
```

Make sure your database connection uses port `5433`.

5. Initialize Prisma for PostgreSQL:

```bash
npx prisma init --datasource-provider postgresql
```

This will show an error saying you already have a `prisma` folder. That is expected for this repository because the `prisma` folder is already committed.

6. Run the initial migration:

```bash
npx prisma migrate dev --name init
```

7. Generate the Prisma client:

```bash
npx prisma generate
```

8. Start the backend in development mode:

```bash
npm run dev
```

9. Open the health endpoint in your browser or with curl:

```bash
curl http://localhost:3000/health
```

If the Prisma commands do not work after setup, restart your laptop and try again.

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
  "time": "2026-08-05T09:38:09.000Z"
}
```

## Notes For Reviewers

- The app is split into a testable factory in `src/app.ts` and a server entrypoint in `src/index.ts`.
- Unit tests live in `tests/health.test.ts`.
- Coverage output is ignored in `.gitignore`.
