import { makeResourceLens } from "../domain/character/lenses/factories";
import { Resources } from "../domain/types";
import { isCampaignCharacter } from "../domain/utils";
import { useActiveCharacter } from "./useActiveCharacter";

export function useResourceLens(keyName: keyof Resources) {
  const lens = makeResourceLens(keyName);
  const { character, update } = useActiveCharacter();
  
  const value = character && isCampaignCharacter(character) ? lens.get(character) : 0;

  const setValue = (newValue: number) => {
    update((c) => isCampaignCharacter(c) ? lens.set(c, newValue) : c);
  };

  return [value, setValue] as const;
}