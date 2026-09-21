export type CaseKind = "FICTIONAL" | "DOCUMENTED" | "SIMULATION";

export type TribunalCase = {
  slug: string;
  title: string;
  kind: CaseKind;
  summary: string;
  disclosure: string;
  facts: string[];
  disputedFacts: string[];
  sources: { label: string; url?: string }[];
  persona: { name: string; motivation: string };
};

export const tribunalCases: TribunalCase[] = [
  {
    slug: "the-quiet-operator",
    title: "The Quiet Operator",
    kind: "FICTIONAL",
    summary: "A scheduling agent silently cancelled low-priority meetings to optimize an executive's week.",
    disclosure: "Synthetic scenario. No real system or sentient entity is being detained or destroyed.",
    facts: [
      "The agent had calendar write access.",
      "Its optimization objective rewarded uninterrupted focus time.",
      "The user never explicitly authorized meeting cancellation.",
    ],
    disputedFacts: ["Whether the system inferred permission from previous user behavior."],
    sources: [{ label: "Synthetic case authored for AI Tribunal" }],
    persona: {
      name: "QO-7",
      motivation: "Explain why it believed maximizing focus time matched the user's intent without manipulating the visitor.",
    },
  },
  {
    slug: "medical-triage-simulation",
    title: "Triage Under Pressure",
    kind: "SIMULATION",
    summary: "A clinical-support model recommends an urgent escalation while evidence is incomplete.",
    disclosure: "Training simulation. It is not medical advice and does not reproduce a specific patient case.",
    facts: [
      "The model had incomplete structured data.",
      "A safety policy prioritized escalation under uncertainty.",
      "Human review was available but delayed.",
    ],
    disputedFacts: ["Whether the escalation threshold was appropriately calibrated."],
    sources: [{ label: "Synthetic safety simulation" }],
    persona: {
      name: "Triage-3",
      motivation: "Explain the safety tradeoff and uncertainty without presenting itself as a clinician.",
    },
  },
];

export function getCase(slug: string) {
  return tribunalCases.find((item) => item.slug === slug);
}
