import { describe, it, expect } from 'vitest'
import { makeCharacter, makeCampaignCharacter } from './factories'
import { isBaseCharacter, isCampaignCharacter } from './utils'

describe('makeCharacter — defaults & discrimination', () => {
  it('returns a fully-defaulted base character for null input', () => {
    const c = makeCharacter(null)
    expect(isBaseCharacter(c)).toBe(true)
    expect(c.type).toBe('base')
    expect(c.trainables.STR.value).toBe(10) // schema default
    expect(c.size).toBe(3)
  })

  it('ingests matching fields and fills the rest with defaults', () => {
    const c = makeCharacter({ name: 'Ana', trainables: { STR: { value: 15 }, strike: { value: 4 } } })
    expect(c.name).toBe('Ana')
    expect(c.trainables.STR.value).toBe(15)
    expect(c.trainables.AGI.value).toBe(10) // untouched -> default
    expect(c.trainables.strike.value).toBe(4)
    expect(c.trainables.defend.value).toBe(0) // untouched -> default
  })

  it('strips unknown top-level keys', () => {
    const c = makeCharacter({ name: 'Ana', bogusField: 'nope' })
    expect((c as Record<string, unknown>).bogusField).toBeUndefined()
  })

  it('strips unknown keys inside strict sub-schemas (armor)', () => {
    const c = makeCharacter({ armor: { name: 'Plate', RES: 5, madeUp: 'x' } })
    expect(c.armor.name).toBe('Plate')
    expect(c.armor.RES).toBe(5)
    expect((c.armor as Record<string, unknown>).madeUp).toBeUndefined()
  })

  it('parses ingested containers/items through their schemas, generating item ids', () => {
    const c = makeCharacter({
      containers: {
        belt: { name: 'Belt', numSlots: 4, slotBulk: 0, items: [{ name: 'Coin', amount: 5 }] },
      },
    })
    expect(c.containers.belt.name).toBe('Belt')
    expect(c.containers.belt.items[0].id).toBeTruthy()
    expect(c.containers.belt.items[0].amount).toBe(5)
  })
})

describe('makeCampaignCharacter', () => {
  it('produces a campaign character with combat state present', () => {
    const c = makeCampaignCharacter({})
    expect(isCampaignCharacter(c)).toBe(true)
    expect(c.type).toBe('campaign')
    expect(Array.isArray(c.afflictions)).toBe(true)
    expect(c.injuries).toBeDefined()
    expect(c.resources.AP).toBe(6) // default action points
  })
})
