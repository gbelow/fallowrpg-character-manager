import { CombatStore } from '@/app/stores/useCombatStore'

export function startTurn(
  store: CombatStore,
) {
  const character = store.getActiveCharacter()
  return(
    {...store, inTurnCharacter: character?.id ?? ''}
  )
  
}