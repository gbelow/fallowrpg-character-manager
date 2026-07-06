import { isCampaignCharacter } from "../domain/utils";
import { useActiveCharacter } from "./useActiveCharacter";

export function useActiveCharacterData() {
  const { character } = useActiveCharacter();
  
  let resp = { fightName: "", hasActionSurge: false, notes: "", TGH: 0, size: 0 }
  if(!character) return resp

  resp.TGH = character?.TGH ?? 0;
  resp.size = character?.size ?? 0;

  if (isCampaignCharacter(character)) {    
      resp.fightName = character.fightName ?? '';
      resp.hasActionSurge = character.hasActionSurge ?? false;
      resp.notes = character.notes ?? '';    
  }

  return resp;
}