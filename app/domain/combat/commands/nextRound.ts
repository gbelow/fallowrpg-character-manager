import { CombatStore } from '@/app/stores/useCombatStore';
import { CampaignCharacter } from '../../types'

// set actionSurge to true to all characters.
// add +6 AP to all characters but do not allow higher than 6
// increase round counter
export function nextRound(
  store: CombatStore
): CombatStore {
  const updatedCharacters: Record<string, CampaignCharacter> = {}

  for (const [id, character] of Object.entries(store.characters)) {
    let updatedCharacter = character

    // Set actionSurge to true
    updatedCharacter = {
      ...updatedCharacter,
      hasActionSurge: true
    }

    // Add +6 AP but cap at 6
    if (updatedCharacter.resources) {
      const newAP = Math.min(6, updatedCharacter.resources.AP + 6)
      updatedCharacter = {
        ...updatedCharacter,
        resources: {
          ...updatedCharacter.resources,
          AP: newAP
        }
      }
    }

    updatedCharacters[id] = updatedCharacter
  }

  return ({
    ...store,
    characters: updatedCharacters,
    round: store.round + 1
  })
}