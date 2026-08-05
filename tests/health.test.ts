import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app";

describe("health endpoint", () => {
  it("returns service status and an ISO timestamp", async () => {
    const response = await request(createApp()).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("UP");
    expect(typeof response.body.time).toBe("string");
    expect(new Date(response.body.time).toISOString()).toBe(
      response.body.time,
    );
  });
});
