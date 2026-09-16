import { describe, expect, it } from "vitest";
import { JobRoleMatcherService } from "../src/services/jobRoleMatcherService";

describe("JobRoleMatcherService", () => {
  const service = new JobRoleMatcherService();

  it("returns the hardcoded question set", () => {
    const questions = service.getQuestions();

    expect(questions.length).toBeGreaterThan(0);
    expect(questions[0]).toHaveProperty("questionId");
    expect(questions[0]).toHaveProperty("capabilityName");
  });

  it("scores a clear winner correctly", () => {
    const scores = service.calculateCapabilityScores([
      { questionId: 1, agreement: 2 },
      { questionId: 2, agreement: -1 },
    ]);

    expect(scores[0]).toEqual({
      capabilityName: "Backend Development",
      score: 2,
    });
    expect(scores[1]).toEqual({
      capabilityName: "Data Science",
      score: -1,
    });
  });

  it("sums multiple answers pointing at the same capability", () => {
    const scores = service.calculateCapabilityScores([
      { questionId: 1, agreement: 1 },
      { questionId: 1, agreement: 1 },
    ]);

    expect(scores).toEqual([
      { capabilityName: "Backend Development", score: 2 },
    ]);
  });

  it("throws for an unknown questionId", () => {
    expect(() =>
      service.calculateCapabilityScores([{ questionId: 999, agreement: 1 }]),
    ).toThrow("Unknown questionId: 999");
  });

  it("returns all tied capabilities when there is a clear tie for top", () => {
    const top = service.getTopCapabilities([
      { questionId: 1, agreement: 2 },
      { questionId: 3, agreement: 2 },
      { questionId: 4, agreement: 0 },
    ]);

    const capabilityNames = top.map((match) => match.capabilityName).sort();
    expect(capabilityNames).toEqual([
      "Backend Development",
      "Frontend Development",
    ]);
  });

  it("falls back to top N when there is no tie", () => {
    const top = service.getTopCapabilities(
      [
        { questionId: 1, agreement: 2 },
        { questionId: 2, agreement: 1 },
        { questionId: 3, agreement: 0 },
      ],
      2,
    );

    expect(top).toEqual([
      { capabilityName: "Backend Development", score: 2 },
      { capabilityName: "Data Science", score: 1 },
    ]);
  });

  it("returns an empty array when no answers are given", () => {
    expect(service.getTopCapabilities([])).toEqual([]);
  });
});
