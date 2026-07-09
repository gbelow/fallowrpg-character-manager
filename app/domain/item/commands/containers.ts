import { Character, CharacterUpdater, Container } from '../../types'

// Equipping a belt/backpack replaces whichever other entry is currently of
// that same kind (including its contents) — "only one belt and one backpack
// at a time". Transports aren't limited this way; multiple can be carried.
export function equipContainer(key: string, container: Container): CharacterUpdater {
  return (character: Character) => {
    const singleton = container.kind === 'belt' || container.kind === 'backpack'
    const remaining = Object.fromEntries(
      Object.entries(character.containers).filter(([otherKey, other]) => {
        if (otherKey === key) return false
        if (singleton && other.kind === container.kind) return false
        return true
      })
    )
    return {
      ...character,
      containers: { ...remaining, [key]: container },
    }
  }
}

export function unequipContainer(key: string): CharacterUpdater {
  return (character: Character) => {
    if (!character.containers[key]) return character
    const { [key]: _removed, ...remaining } = character.containers
    return { ...character, containers: remaining }
  }
}
