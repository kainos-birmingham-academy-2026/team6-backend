# Login And Job Roles API Capture

Captured from the frontend running at `http://localhost:3001` while the backend was running at `http://localhost:3000`.

## Browser Action Performed

1. Opened `http://localhost:3001`.
2. Clicked `Job Roles`.
3. The frontend redirected to `/login` because the user was not signed in.
4. Registered a test user.
5. Signed in with that user.
6. Opened `Job Roles` successfully.

## Captured Browser-Side cURL

The browser submitted the login form to the frontend server:

```bash
curl 'http://localhost:3001/login' \
  -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H 'Origin: http://localhost:3001' \
  -H 'Referer: http://localhost:3001/login' \
  --data-raw 'email=api-capture-1787235102938%40example.com&password=Password%21123' \
  -i
```

After login, the browser loaded the job roles page:

```bash
curl 'http://localhost:3001/job-roles' \
  -H 'Referer: http://localhost:3001/login' \
  -i
```

The browser-visible request goes to `localhost:3001` because the frontend uses server-rendered form posts. The browser does not directly expose the internal backend call from the frontend server to `localhost:3000`.

## Backend API Equivalent cURL

For backend API test automation, the equivalent direct backend calls are:

```bash
curl 'http://localhost:3000/auth/login' \
  -X POST \
  -H 'Content-Type: application/json' \
  --data-raw '{"email":"api-capture-1787235102938@example.com","password":"Password!123"}'
```

Then use the returned token to view job roles:

```bash
curl 'http://localhost:3000/job-roles' \
  -H 'Authorization: Bearer <TOKEN_FROM_LOGIN_RESPONSE>'
```

## Generated Playwright API Test Code

```ts
import { expect, test } from "@playwright/test";

const frontendBaseUrl = process.env.FRONTEND_BASE_URL ?? "http://localhost:3001";
const backendBaseUrl = process.env.API_BASE_URL ?? "http://localhost:3000";
const email = process.env.TEST_USER_EMAIL ?? "api-capture-1787235102938@example.com";
const password = process.env.TEST_USER_PASSWORD ?? "Password!123";

test("logs in through the frontend form flow and views job roles", async ({ request }) => {
  const loginResponse = await request.post(`${frontendBaseUrl}/login`, {
    form: {
      email,
      password,
    },
    maxRedirects: 0,
  });

  expect([200, 302]).toContain(loginResponse.status());

  const jobRolesResponse = await request.get(`${frontendBaseUrl}/job-roles`);

  expect(jobRolesResponse.ok()).toBe(true);
  const jobRolesPage = await jobRolesResponse.text();
  expect(jobRolesPage).toContain("Open Job Roles at Kainos");
});

test("logs in through the backend API and fetches job roles", async ({ request }) => {
  const loginResponse = await request.post(`${backendBaseUrl}/auth/login`, {
    data: {
      email,
      password,
    },
  });

  expect(loginResponse.ok()).toBe(true);

  const loginBody = await loginResponse.json();
  expect(loginBody.token).toEqual(expect.any(String));

  const jobRolesResponse = await request.get(`${backendBaseUrl}/job-roles`, {
    headers: {
      Authorization: `Bearer ${loginBody.token}`,
    },
  });

  expect(jobRolesResponse.ok()).toBe(true);

  const jobRoles = await jobRolesResponse.json();
  expect(Array.isArray(jobRoles)).toBe(true);
});
```