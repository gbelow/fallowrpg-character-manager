import { describe, it, expect } from 'vitest'
import { addAffliction } from './addAffliction'
import { bleed, updateSTA } from './bleed'
import { resetSkill, resetAllSkills } from './resetSkills'
import { makeCampaignCharacter, makeCharacter } from '../../factories'
import type { CampaignCharacter } from '../../types'

function campaign(overrides: Partial<CampaignCharacter> = {}): CampaignCharacter {
  const base = makeCampaignCharacter({})
  return {
    ...base,
    ...overrides,
    resources: { ...base.resources, ...(overrides.resources ?? {}) },
    injuries: { ...base.injuries, ...(overrides.injuries ?? {}) },
  }
}

// Commands are pure updaters: (character) => character. They must never mutate
// their input — that is what lets stores treat every update as a fresh value.
describe('command purity', () => {
  it('addAffliction does not mutate the input', () => {
    const c = campaign()
    const before = [...c.afflictions]
    addAffliction('prone')(c)
    expect(c.afflictions).toEqual(before)
  })

  it('bleed does not mutate the input', () => {
    const c = campaign({ injuries: { hemorrhage: 3 } as CampaignCharacter['injuries'] })
    const level = c.injuries.injuryLevel
    bleed(2)(c)
    expect(c.injuries.injuryLevel).toBe(level)
  })

  it('resetSkill does not mutate the input', () => {
    const c = makeCharacter({ skills: { strike: 5 } })
    resetSkill('strike')(c)
    expect(c.skills.strike).toBe(5)
  })
})

describe('addAffliction', () => {
  it('toggles an affliction on and back off', () => {
    const c = campaign()
    const added = addAffliction('prone')(c)
    expect(added.afflictions).toContain('prone')

    const removed = addAffliction('prone')(added)
    expect(removed.afflictions).not.toContain('prone')
  })
})

describe('bleed / updateSTA', () => {
  it('bleed raises injuryLevel by amount * hemorrhage', () => {
    const c = campaign({ injuries: { hemorrhage: 3 } as CampaignCharacter['injuries'] })
    expect(bleed(2)(c).injuries.injuryLevel).toBe(6)
  })

  it('updateSTA lowers STA and bleeds the lost stamina', () => {
    const c = campaign({
      resources: { STA: 10 } as CampaignCharacter['resources'],
      injuries: { hemorrhage: 2 } as CampaignCharacter['injuries'],
    })
    const after = updateSTA(7)(c) // lost 3 STA -> 3 * 2 = 6 injury
    expect(after.resources.STA).toBe(7)
    expect(after.injuries.injuryLevel).toBe(6)
  })

  it('updateSTA is a no-op when STA increases', () => {
    const c = campaign({ resources: { STA: 10 } as CampaignCharacter['resources'] })
    expect(updateSTA(12)(c)).toBe(c)
  })
})

describe('resetSkills', () => {
  it('resetSkill zeroes one skill and leaves the rest', () => {
    const c = makeCharacter({ skills: { strike: 5, defend: 4 } })
    const after = resetSkill('strike')(c)
    expect(after.skills.strike).toBe(0)
    expect(after.skills.defend).toBe(4)
  })

  it('resetAllSkills zeroes every skill', () => {
    const c = makeCharacter({ skills: { strike: 5, defend: 4, reflex: 3 } })
    const after = resetAllSkills()(c)
    expect(Object.values(after.skills).every((v) => v === 0)).toBe(true)
  })
})
