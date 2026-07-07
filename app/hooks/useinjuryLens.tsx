import { getInjuryPenalty } from "../domain/character/lenses/afflictions";
import { composeLens, propLens } from "../domain/character/lenses/factories";
import { CampaignCharacter, CampaignValuesSchema, Injuries } from "../domain/types";
import { isCampaignCharacter } from "../domain/utils";
import { useActiveCharacter } from "./useActiveCharacter";

export function useInjuryLens() {
  const injuryLens = propLens<CampaignCharacter, 'injuries'>('injuries')
  
  const { character, update } = useActiveCharacter();
  
  const injuries = character && isCampaignCharacter(character) ? injuryLens.get(character) : CampaignValuesSchema.parse({}).injuries;

  const setInjury = (keyName: keyof Injuries, newValue: number | number[]) => {
    const injuryValueLens = composeLens(injuryLens, propLens<Injuries, keyof Injuries>(keyName));
    update((c) => isCampaignCharacter(c) ? injuryValueLens.set(c, newValue) : c);
  };

  const isCharacterDead = () =>{
    if(!character || !isCampaignCharacter(character)) return false 
    return getInjuryPenalty(character) >= 5
  }
  


  return {injuries, setInjury, isCharacterDead} as const;
  
}