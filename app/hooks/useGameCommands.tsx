import { toast } from "sonner"
import { useAppStore } from "../stores/useAppStore"
import { readActiveCharacter } from "./useActiveCharacterSelector"
import { saveCharacter } from "../actions"

export function useGameCommands() {

  const tab = useAppStore((s) => s.selectedGameTab)
  const updatePlayerCharacterList = useAppStore(s => s.updatePlayerCharacterList)

  const savePlayerCharacter = async () => {
    const character = readActiveCharacter(tab)
    if (!character) return
    const res = await saveCharacter(character)
    if (!res.ok) { toast.error(res.error); return }
    toast.success('Character saved.')
    updatePlayerCharacterList()
  }

  return { savePlayerCharacter }
}
