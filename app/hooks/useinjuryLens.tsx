import { makeInjuryLens } from "../domain/selectors/factories";
import { CampaignValuesSchema, Injuries, Wound } from "../domain/types";
import { isCampaignCharacter } from "../domain/utils";
import { useActiveCharacter } from "./useActiveCharacter";

export function useInjuryLens() {
  const lens = makeInjuryLens();
  const { character, update } = useActiveCharacter();
  
  const injuries = character && isCampaignCharacter(character) ? lens.get(character) : CampaignValuesSchema.parse({}).injuries;

  const setInjury = (keyName: keyof Injuries, newValue: number | Wound) => {
    update((c) => isCampaignCharacter(c) ? lens.set(c, keyName, newValue) : c);
  };
  


  return {injuries, setInjury} as const;
  
}