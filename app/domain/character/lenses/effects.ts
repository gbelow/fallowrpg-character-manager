import { Ability, Buff, Character, Effect } from '../../types'
import { isCampaignCharacter } from '../../utils'

function isBuff(effect: Effect): effect is Extract<Effect, { type: 'buff' }> {
  return effect.type === 'buff'
}

// Buffs can come from two sources: passive abilities (always contribute
// while learned) and activeEffects (toggle/active abilities, only while on).
// abilities is the abilities.json catalog keyed by name, same convention as
// weapons/containers records elsewhere on Character.
export function collectBuffs(character: Character, abilities: Record<string, Ability>): Buff[] {
  const passive = character.abilities
    .map(name => abilities[name])
    .filter((a): a is Ability => a !== undefined && a.activation === 'passive')
    .flatMap(a => a.effect)

  const active: Effect[] = isCampaignCharacter(character)
    ? character.activeEffects
    : []

  return [...passive, ...active].filter(isBuff).map(e => e.effect)
}

export function groupBuffsByTarget(buffs: Buff[]): Record<string, Buff[]> {
  const grouped: Record<string, Buff[]> = {}
  for (const buff of buffs) {
    (grouped[buff.target] ??= []).push(buff)
  }
  return grouped
}

export function getBuffsForTarget(
  character: Character,
  abilities: Record<string, Ability>,
  target: string
): Buff[] {
  return groupBuffsByTarget(collectBuffs(character, abilities))[target] ?? []
}
