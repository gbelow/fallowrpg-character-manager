import { BaseCharacter, CampaignCharacter, Character } from "./types"

function makeFightName(char: CampaignCharacter, characters: Record<string, CampaignCharacter>){
  let newName = char.name
  let count = 1
  while(Object.values(characters).find(el => el.fightName == newName) ){
    count++
    newName = char.name + count
  }
  return newName
}

export function addCharacterToCombat(char: CampaignCharacter, characters: Record<string, CampaignCharacter>) : CampaignCharacter {
  const fightName = makeFightName(char, characters)
  return { ...char, fightName }
}

export function isCampaignCharacter( 
  c: Character
): c is CampaignCharacter {
  return c.type === 'campaign'
}

export function isBaseCharacter( 
  c: Character
): c is BaseCharacter {
  return c.type === 'base'
}
