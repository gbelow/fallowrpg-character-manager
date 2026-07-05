import { describe, it, expect } from 'vitest'
import { skillLenses, characteristicLenses, movementLenses } from './index'
import { makeCharacter } from '../../factories'
import type { Characteristics, Movement, Skills } from '../../types'

// The core architectural promise of the domain layer: a lens `set(c, v)` writes
// through the modifiers to the stored *base* so that reading the same lens back
// returns exactly `v`. If this holds, the UI can bind two-way to a derived value
// and trust the round-trip. These tests are the proof of that claim.
//
// The subject deliberately carries non-trivial base values everywhere, so a
// broken inversion cannot accidentally pass by echoing an unchanged number.
function subject() {
  return makeCharacter({
    characteristics: {
      STR: 12, AGI: 11, STA: 13, CON: 4, INT: 3, SPI: 2, DEX: 5,
      size: 3, melee: 2, ranged: 1, awareness: 3, sorcery: 1, charisma: 2,
      conviction1: 1, conviction2: 1, TGH: 0,
    },
    skills: {
      strike: 3, defend: 2, reflex: 1, accuracy: 4, SD: 2, stealth: 1,
      prestidigitation: 2, balance: 1, health: 3, swim: 1, climb: 2,
      explore: 1, will: 2, persuasion: 1, deception: 1, insight: 1, devotion: 1,
    },
  })
}

const TARGET = 7

// Getters whose result does NOT read the stored base with a +1 coefficient, so
// the generic setter's inversion assumption cannot hold. Documented, not fixed.
//   grapple   – getGrapple has its `skill('grapple')` term commented out
//   detection – getDetection ignores skills.detection entirely
//   cunning   – getCunning SUBTRACTS skills.cunning (negative coefficient)
// const NON_INVERTIBLE_SKILLS = ['grapple', 'cunning', 'detection'] as const

describe('lens inversion — skills', () => {
  const invertible = (Object.keys(skillLenses) as (keyof Skills)[])
    // .filter((k) => !NON_INVERTIBLE_SKILLS.includes(k as never))

  it.each(invertible)('set → get round-trips for "%s"', (skill) => {
    const lens = skillLenses[skill]
    expect(lens.get(lens.set(subject(), TARGET))).toBe(TARGET)
  })
})

// describe('lens inversion — skills (KNOWN violations, expected to fail until fixed)', () => {
//   for (const skill of NON_INVERTIBLE_SKILLS) {
//     it.fails(`set → get round-trips for "${skill}"`, () => {
//       const lens = skillLenses[skill]
//       expect(lens.get(lens.set(subject(), TARGET))).toBe(TARGET)
//     })
//   }
// })

describe('lens inversion — characteristics', () => {
  // "devotion" reuses getDevotion (SPI + skills.devotion) and never reads the
  // stored characteristics.devotion, so it cannot round-trip. Left as-is for now
  // (it needs dedicated treatment later), so it stays a documented exception.
  const nonInvertible: (keyof Characteristics)[] = ['devotion']
  const invertible = (Object.keys(characteristicLenses) as (keyof Characteristics)[])
    .filter((k) => !nonInvertible.includes(k))

  it.each(invertible)('set → get round-trips for "%s"', (name) => {
    const lens = characteristicLenses[name]
    expect(lens.get(lens.set(subject(), TARGET))).toBe(TARGET)
  })

  it.fails('set → get round-trips for "devotion" (KNOWN: getter ignores stored base)', () => {
    const lens = characteristicLenses.devotion
    expect(lens.get(lens.set(subject(), TARGET))).toBe(TARGET)
  })

  // TGH now uses floor(0.5*STR*DM + base) — the base term is unscaled, so the
  // generic setter inverts at every size, not just DM=1.
  it('set → get round-trips for "TGH" at DM != 1', () => {
    const larger = makeCharacter({ characteristics: { STR: 11, size: 4, TGH: 0 } })
    const lens = characteristicLenses.TGH
    expect(lens.get(lens.set(larger, TARGET))).toBe(TARGET)
  })
})

describe('lens inversion — movement', () => {
  it.each(Object.keys(movementLenses) as (keyof Movement)[])(
    'set → get round-trips for "%s"',
    (name) => {
      const lens = movementLenses[name]
      expect(lens.get(lens.set(subject(), TARGET))).toBe(TARGET)
    },
  )
})
