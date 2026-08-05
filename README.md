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

8. Seed the database with dummy data:

```bash
docker exec -it jobs-db psql -U postgres -d job-roles -c "
INSERT INTO \"Capability\" (\"capabilityName\") VALUES
  ('Engineering'),
  ('Business Analysis'),
  ('Delivery Management');

INSERT INTO \"Band\" (\"bandName\") VALUES
  ('Trainee'),
  ('Associate'),
  ('Consultant'),
  ('Senior Consultant');

INSERT INTO \"job-roles\" (\"roleName\", \"location\", \"capabilityId\", \"bandId\", \"closingDate\", \"status\") VALUES
  ('Software Engineer', 'Belfast', 1, 2, '2026-12-31', 'open'),
  ('Business Analyst', 'Birmingham', 2, 3, '2026-11-30', 'open'),
  ('Delivery Manager', 'London', 3, 4, '2026-10-15', 'open'),
  ('Junior Developer', 'Remote', 1, 1, '2026-09-01', 'open');
"
```

9. Start the backend in development mode:

```bash
npm run dev
```

10. Open the health endpoint in your browser or with curl:

```bash
curl http://localhost:3000/health
```

11. Fetch all job roles:

```bash
curl http://localhost:3000/job-roles
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

## API Endpoints

### Health

- `GET /health`

Response example:

```json
{
  "status": "UP",
  "time": "2026-08-05T09:38:09.000Z"
}
```

### Job Roles

- `GET /job-roles` — returns all job roles from the database

Response example:

```json
[
  {
    "jobRoleId": 1,
    "roleName": "Software Engineer",
    "location": "Belfast",
    "capabilityId": 1,
    "bandId": 2,
    "closingDate": "2026-12-31T00:00:00.000Z",
    "status": "open"
  }
]
```

## Notes For Reviewers

- The app is split into a testable factory in `src/app.ts` and a server entrypoint in `src/index.ts`.
- Unit tests live in `tests/` and cover the service and controller layers with mocked dependencies.
- Coverage output is ignored in `.gitignore`.
