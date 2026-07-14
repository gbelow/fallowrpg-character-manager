import { useActiveCharacterUpdate } from "./useActiveCharacterSelector"
import {
  actionSurge as doActionSurge,
  addAffliction,
  restCharacter,
  updateIL as heal,
  updateSTA as bleed,
} from "../domain/character/commands"
import { AfflictionKey } from "../domain/types"


export function useCharacterCommands() {

  const update = useActiveCharacterUpdate()

  const actionSurge = () => {
    update(doActionSurge)
  }

  const putAffliction = (affliction: AfflictionKey) => {
    update(addAffliction(affliction))
  }

  const rest = () => {
    update(restCharacter)
  }

  const cureIL = (newIL: number) => {
    update(heal(newIL))
  }

  const updateSTA = (newSTA: number) => {
    update(bleed(newSTA))
  }

  return { actionSurge: actionSurge, putAffliction, rest, cureIL, updateSTA }
}
