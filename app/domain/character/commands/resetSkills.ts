import { Character, CharacterUpdater, Skills } from '../../types'

export function resetSkill(
  skill: keyof Skills
): CharacterUpdater {
  return (character: Character) => ({
    ...character,
    trainables: {
      ...character.trainables,
      [skill]: { ...character.trainables[skill], value: 0 },
    },
  })
}

export function resetAllSkills(
): CharacterUpdater {
  return (character: Character) => {
    const trainables = Object.fromEntries(
      Object.entries(character.trainables).map(([key, t]) =>
        t.type === 'skill' ? [key, { ...t, value: 0 }] : [key, t]
      )
    )
    return { ...character, trainables } as Character
  }
}

