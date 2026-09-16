import type {
  CapabilityMatch,
  MatcherAnswer,
  MatcherQuestion,
} from "../models/jobRoleMatcherModels";

// Each question maps directly to one capability, matching the real
// capabilities in the database.
export const matcherQuestions: MatcherQuestion[] = [
  {
    questionId: 1,
    text: "I enjoy building scalable backend APIs, databases, and server-side systems",
    capabilityName: "Backend Development",
  },
  {
    questionId: 2,
    text: "I like analyzing complex data, discovering insights, and working with data models",
    capabilityName: "Data Science",
  },
  {
    questionId: 3,
    text: "I love creating interactive, responsive user interfaces and web applications",
    capabilityName: "Frontend Development",
  },
  {
    questionId: 4,
    text: "I enjoy cloud infrastructure, CI/CD automation, and deployment pipelines",
    capabilityName: "DevOps",
  },
  {
    questionId: 5,
    text: "I like designing test strategies, finding bugs, and ensuring high software quality",
    capabilityName: "QA Testing",
  },
];

export class JobRoleMatcherService {
  getQuestions(): MatcherQuestion[] {
    return matcherQuestions;
  }

  calculateCapabilityScores(answers: MatcherAnswer[]): CapabilityMatch[] {
    const scores = new Map<string, number>();

    for (const answer of answers) {
      const question = matcherQuestions.find(
        (q) => q.questionId === answer.questionId,
      );

      if (!question) {
        throw new Error(`Unknown questionId: ${answer.questionId}`);
      }

      const current = scores.get(question.capabilityName) ?? 0;
      scores.set(question.capabilityName, current + answer.agreement);
    }

    return [...scores.entries()]
      .map(([capabilityName, score]) => ({ capabilityName, score }))
      .sort((a, b) => b.score - a.score);
  }

  getTopCapabilities(answers: MatcherAnswer[], topN = 2): CapabilityMatch[] {
    const ranked = this.calculateCapabilityScores(answers);

    if (ranked.length === 0) {
      return [];
    }

    const topScore = ranked[0].score;
    const clearMatches = ranked.filter((match) => match.score === topScore);

    return clearMatches.length >= topN
      ? clearMatches
      : ranked.slice(0, topN);
  }
}
