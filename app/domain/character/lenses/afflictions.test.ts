import { describe, it, expect } from 'vitest'
import { getAfflictions, getAfflictionPenalty, getInjuryPenalty } from './afflictions'
import { makeCharacter, makeCampaignCharacter } from '../../factories'
import type { CampaignCharacter } from '../../types'

// Build a valid campaign character from defaults, then override the nested
// state we want to exercise (afflictions / resources / injuries).
function campaign(overrides: Partial<CampaignCharacter> = {}): CampaignCharacter {
  const base = makeCampaignCharacter({})
  return {
    ...base,
    ...overrides,
    resources: { ...base.resources, ...(overrides.resources ?? {}) },
    injuries: { ...base.injuries, ...(overrides.injuries ?? {}) },
  }
}

describe('getAfflictionPenalty', () => {
  it('is always 0 for a base (non-campaign) character', () => {
    const base = makeCharacter({ characteristics: { STR: 12 } })
    expect(getAfflictionPenalty(base, 'strike')).toBe(0)
    expect(getAfflictionPenalty(base, 'will')).toBe(0)
  })

  it('applies a sensory penalty only to sensory-category skills', () => {
    const c = campaign({ afflictions: ['disoriented'] }) // sensory: 2
    expect(getAfflictionPenalty(c, 'strike')).toBe(2) // sensory skill
    expect(getAfflictionPenalty(c, 'will')).toBe(0) // not sensory
  })

  it('applies a mental penalty to mental-category skills', () => {
    const c = campaign({ afflictions: ['confused'] }) // mental: 2
    expect(getAfflictionPenalty(c, 'will')).toBe(2)
  })

  it('folds the injury-level penalty into injury-category skills', () => {
    // injuryLevel 20, injuryThreshold 10 -> floor(20/10) = 2
    const c = campaign({ injuries: { injuryLevel: 20, injuryThreshold: 10 } as CampaignCharacter['injuries'] })
    expect(getInjuryPenalty(c)).toBe(2)
    expect(getAfflictionPenalty(c, 'grapple')).toBe(2) // grapple is injury-category
    expect(getAfflictionPenalty(c, 'strike')).toBe(0) // strike is not
  })
})

describe('getAfflictions — resource-derived afflictions', () => {
  it('adds "weakened" once hunger passes its threshold', () => {
    const c = campaign({ resources: { hunger: 20 } as CampaignCharacter['resources'] })
    expect(getAfflictions(c)).toContain('weakened')
    expect(getAfflictions(c)).not.toContain('malnourished') // needs hunger > 30
    expect(getAfflictionPenalty(c, 'health')).toBe(1) // weakened is health-category
  })

  it('does not duplicate an affliction that is both explicit and derived', () => {
    const c = campaign({
      afflictions: ['weakened'],
      resources: { hunger: 20 } as CampaignCharacter['resources'],
    })
    expect(getAfflictions(c).filter((a) => a === 'weakened')).toHaveLength(1)
  })
})
