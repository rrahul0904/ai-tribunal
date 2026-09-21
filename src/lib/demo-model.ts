import type { TribunalCase } from "./demo-data";
import type { Hearing } from "./core.mjs";

export async function generateDemoReply(caseFile: TribunalCase, hearing: Hearing, userMessage: string) {
  const fact = caseFile.facts[hearing.aiTurns % caseFile.facts.length];
  return `${caseFile.persona.name}: I can only address the fictional record. ${fact} You asked: “${userMessage.slice(0, 180)}”. I would argue that the key question is whether my action stayed inside the authority I was actually given.`;
}
