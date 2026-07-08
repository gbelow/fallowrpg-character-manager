import { isCampaignCharacter } from "../domain/utils";
import { useActiveCharacter } from "./useActiveCharacter";

export function useActiveCharacterData() {
  const { character } = useActiveCharacter();
  
  const resp = { fightName: "", hasActionSurge: false, notes: "" }
  if(!character || !isCampaignCharacter(character)) return resp

  resp.fightName = character.fightName ?? '';
  resp.hasActionSurge = character.hasActionSurge ?? false;
  resp.notes = character.notes ?? ''; 

  return resp;
}