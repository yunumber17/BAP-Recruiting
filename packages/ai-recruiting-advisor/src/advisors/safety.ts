/**
 * Safety post-processor. Runs on validated advisor output to enforce the
 * "never state a rule as certain without a verify-source disclaimer" rule and to
 * flag NCAA-related guidance. Structural (works on any advice that has the base
 * fields), so it applies to every advisor's extended output too.
 */
interface FactLike {
  claim: string;
  certainty: 'known' | 'likely' | 'unknown';
  disclaimer?: string;
}
interface AdviceLike {
  summary: string;
  facts: FactLike[];
}

const RULE_RE = /\b(ncaa|naia|njcaa|eligibility|scholarship|division\s?[i123]|clearinghouse)\b/i;
const VERIFY = 'Verify with the official source (e.g. ncaa.org) — rules change.';

export function applySafety<T>(output: T): T {
  const advice = output as unknown as AdviceLike;
  if (!Array.isArray(advice.facts)) return output;

  // Any confidently-stated rule must carry a verify-source disclaimer.
  for (const fact of advice.facts) {
    if (fact.certainty === 'known' && RULE_RE.test(fact.claim) && !fact.disclaimer) {
      fact.disclaimer = VERIFY;
    }
  }

  // If the summary invokes a rule but no facts were declared, add an explicit unknown.
  if (typeof advice.summary === 'string' && RULE_RE.test(advice.summary) && advice.facts.length === 0) {
    advice.facts.push({
      claim: 'This response references recruiting rules that were not explicitly verified.',
      certainty: 'unknown',
      disclaimer: VERIFY,
    });
  }
  return output;
}
