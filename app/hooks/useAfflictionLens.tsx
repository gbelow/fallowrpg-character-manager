import { addAffliction } from "../domain/commands/addAffliction";
import { getAfflictions } from "../domain/selectors/afflictions";
import { AfflictionKey } from "../domain/types";
import { isCampaignCharacter } from "../domain/utils";
import { useActiveCharacter } from "./useActiveCharacter";

export function useAfflictionLens() {
  const { character, update } = useActiveCharacter();
  const value = character && isCampaignCharacter(character) ? getAfflictions(character) : []

  const setValue = (affliction: AfflictionKey) => {
    update(addAffliction(affliction))
  };

  return [value, setValue] as const;
}