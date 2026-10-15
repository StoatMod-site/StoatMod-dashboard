import { categoryScores, policyName } from "./lib/moderation-display";

export function CategoryScores({ scores, preview = 4 }: { scores: unknown; preview?: number }) {
  const entries = categoryScores(scores);
  if (!entries.length) return null;
  const row = ([category, score]: [string, number]) => <div className="signal-row" key={category}>
    <div><span>{policyName(category)}</span><strong>{(score * 100).toFixed(2)}%</strong></div>
    <div className="signal-track" role="meter" aria-label={`${policyName(category)} model score`} aria-valuenow={Number((score * 100).toFixed(2))} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${score * 100}%` }}/></div>
  </div>;
  return <div className="category-signals">
    {entries.slice(0, preview).map(row)}
    {entries.length > preview && <details className="remaining-signals"><summary>Show {entries.length - preview} more scores</summary>{entries.slice(preview).map(row)}</details>}
  </div>;
}
