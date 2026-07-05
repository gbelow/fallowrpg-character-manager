import { toast } from "sonner"
import { useAppStore } from "../stores/useAppStore"
import { useActiveCharacter } from "./useActiveCharacter"
import { saveCharacter } from "../actions"

export function useGameCommands() {

  const { character } = useActiveCharacter()
  const updatePlayerCharacterList = useAppStore(s => s.updatePlayerCharacterList)

  const savePlayerCharacter = async () => {
    if(!character) return
    const res = await saveCharacter(character)
    if(!res.ok){ toast.error(res.error); return }
    toast.success('Character saved.')
    updatePlayerCharacterList()
  }

  return { savePlayerCharacter }
}