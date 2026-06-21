import { CombatStore } from "@/app/stores/useCombatStore";

// clear all characters from combat and reset round counter
export function resetCombat(store: CombatStore): CombatStore {
  return ({
    ...store,
    characters: {},
    round: 0
  })
}