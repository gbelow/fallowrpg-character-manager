import { CampaignCharacter, Character } from "../domain/types";
import { useAppStore } from "../stores/useAppStore";
import { useCharacterStore } from "../stores/useCharacterStore";
import { useCombatStore } from "../stores/useCombatStore";

type CharacterUpdater = (c: Character) => Character;
type CampaignUpdater = (c: CampaignCharacter) => CampaignCharacter;

export function useActiveCharacter() {
  const selectedTab = useAppStore(s => s.selectedGameTab);

  const char = useCharacterStore(s => s.character);
  const combatChar = useCombatStore(s => s.getActiveCharacter());

  const activeChar = selectedTab === 'edit' ? char : combatChar;

  const updateCharacter = useCharacterStore(s => s.updateCharacter);
  const updateCombatActive = useCombatStore(s => s.updateActiveCharacter);

  // Overloaded so callers get real type-checking on their updater: a plain
  // `Character` updater works everywhere, while `CampaignCharacter`-only
  // updaters (afflictions, injuries, resources, …) match the campaign form.
  // The `edit` tab edits a `Character`; `play`/`break` edit the combat
  // (campaign) character, hence the two backing stores.
  function update(updater: CharacterUpdater): Character | undefined;
  function update(updater: CampaignUpdater): CampaignCharacter | undefined;
  function update(updater: CharacterUpdater | CampaignUpdater) {
    if (selectedTab === 'edit') {
      return updateCharacter(updater as CharacterUpdater);
    }
    return updateCombatActive(updater as CampaignUpdater);
  }

  return { character: activeChar, update };
}