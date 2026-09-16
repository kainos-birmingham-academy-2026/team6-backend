export type MatcherQuestion = {
  questionId: number;
  text: string;
  capabilityName: string;
};

export type MatcherAnswer = {
  questionId: number;
  agreement: number;
};

export type CapabilityMatch = {
  capabilityName: string;
  score: number;
};
