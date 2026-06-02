import { CampaignCharacter, Character } from "../domain/types";
import { useAppStore } from "../stores/useAppStore";
import { useCharacterStore } from "../stores/useCharacterStore";
import { useCombatStore } from "../stores/useCombatStore";

export function useActiveCharacter() {
  const selectedTab = useAppStore(s => s.selectedGameTab);
  
  const char = useCharacterStore(s => s.character);
  const combatChar = useCombatStore(s => s.getActiveCharacter());

  const activeChar = selectedTab === 'edit' ? char : combatChar;

  const updateCharacter = useCharacterStore(s => s.updateCharacter);
  const updateCombatActive = useCombatStore(s => s.updateActiveCharacter);

  const unifiedUpdate = <T extends Character>(updater: (c: T) => T) => {
    if (selectedTab === 'edit') {
      return updateCharacter(updater as unknown as (c: Character) => Character);
    } else if (selectedTab === 'play') {
      return updateCombatActive(updater as unknown as (c: CampaignCharacter) => CampaignCharacter);
    } else if (selectedTab === 'break') {
      return updateCombatActive(updater as unknown as (c: CampaignCharacter) => CampaignCharacter);
    }
  };

  return { character: activeChar, update: unifiedUpdate };
}