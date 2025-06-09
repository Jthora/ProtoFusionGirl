// Types for Universal Language (UL) engine

export type ULExpression = {
  predicates: string[];
  valid: boolean;
  error?: string;
};

export type ULFeedback = {
  step: number;
  valid: boolean;
  hint?: string;
};
