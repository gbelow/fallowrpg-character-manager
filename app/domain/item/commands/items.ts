import { Character, CharacterUpdater, Item } from '../../types'
import { canFitItem } from '../lenses/containers'

export function duplicateItem(item: Item, overrides: Partial<Pick<Item, 'amount'>> = {}): Item {
  return { ...item, id: crypto.randomUUID(), ...overrides }
}

export function addItemToContainer(containerKey: string, item: Item): CharacterUpdater {
  return (character: Character) => {
    const container = character.containers[containerKey]
    if (!container) {
      throw new Error(`Container "${containerKey}" not found`)
    }
    if (!canFitItem(container, item)) {
      throw new Error(`Item "${item.name || item.refId}" does not fit in container "${containerKey}"`)
    }
    return {
      ...character,
      containers: {
        ...character.containers,
        [containerKey]: { ...container, items: [...container.items, item] },
      },
    }
  }
}

export function removeItemFromContainer(containerKey: string, itemId: string): CharacterUpdater {
  return (character: Character) => {
    const container = character.containers[containerKey]
    if (!container) return character

    return {
      ...character,
      containers: {
        ...character.containers,
        [containerKey]: { ...container, items: container.items.filter(item => item.id !== itemId) },
      },
    }
  }
}
