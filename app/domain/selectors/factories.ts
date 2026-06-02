import { CampaignCharacter, Character, Injuries, Resources, Wound } from "../types";

export function makeTextLens(keyName: keyof Character){
  return {
    get: (character: Character) => {
      return character[keyName]
    },
    set: (character: Character, value: string) => {
      return ({...character, [keyName]: value})
    }
  }
}

export function makeResourceLens(keyName: keyof Resources){
  return {
    get: (character: CampaignCharacter) => {
      return character.resources[keyName]
    },
    set: (character: CampaignCharacter, value: number) => {
      return ({...character, resources:{...character.resources, [keyName]: value}})
    }
  }
}

export function makeInjuryLens (){
  return {
    get: (character: CampaignCharacter) => {
      return character.injuries
    },
    set: (character: CampaignCharacter, keyName: keyof Injuries,  value: number | Wound) => {
      const updatedInjuries = {...character.injuries, [keyName]: value}
      return ({...character, injuries: updatedInjuries})
    },
  }
}