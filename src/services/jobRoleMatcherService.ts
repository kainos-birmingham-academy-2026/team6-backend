import type {
  CapabilityMatch,
  MatcherAnswer,
  MatcherQuestion,
} from "../models/jobRoleMatcherModels";

// Each question maps directly to one capability, matching the real
// capabilities seeded in the database (see prisma/seed.sql).
export const matcherQuestions: MatcherQuestion[] = [
  {
    questionId: 1,
    text: "I enjoy building and shipping software",
    capabilityName: "Engineering",
  },
  {
    questionId: 2,
    text: "I like bridging business needs and technical solutions",
    capabilityName: "Business Analysis",
  },
  {
    questionId: 3,
    text: "I enjoy shaping product direction and roadmaps",
    capabilityName: "Product Management",
  },
  {
    questionId: 4,
    text: "I care about how things look and feel to use",
    capabilityName: "Design",
  },
  {
    questionId: 5,
    text: "I like finding what's broken before customers do",
    capabilityName: "Quality Assurance",
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
