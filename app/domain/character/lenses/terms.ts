// Shared read-side projection for breakdowns.
//
// Each derived getter is computed from its `*Terms` array via `sumTerms`, so
// the displayed value and the per-term tooltip breakdown can never drift.
// `Term` is a read projection (not persisted/ingested), so it lives in the
// lenses layer rather than in types.ts. Shared here so both `skills.ts` and
// `characteristics.ts` can use it without importing each other.
export type Term = { label: string; value: number }

export const sumTerms = (terms: Term[]): number => terms.reduce((s, t) => s + t.value, 0)
