import { CampaignCharacter, Character, Injuries, Lens, Resources, Trainables, Wound } from "../../types";

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

export function makeSimpleLens<T extends Character> (
  propertyName: 'size' | 'TGH', 
  getter: (c: T) => number, 
  setter?: (c: T, value: number) => T): Lens<T, number> {
  return {
    get: getter,
    set: setter ?? ((subject: T, value: number): T => {
      const baseValue = subject[propertyName];
      const modifiers = getter(subject) - (parseInt(baseValue+'') || 0);
      
      return {
        ...subject,
          [propertyName]: value - modifiers
      } as T;
    })
  };
}

export function makeTrainableValueLens<T extends Character>(
  trainableName: keyof Trainables,
  getter: (c: T) => number,
  setter?: (c: T, value: number) => T
): Lens<T, number> {
  return {
    get: getter,
    set: setter ?? ((subject: T, value: number): T => {
      const baseValue = subject.trainables[trainableName].value;
      const modifiers = getter(subject) - baseValue;

      return {
        ...subject,
        trainables: { 
          ...subject.trainables, 
          [trainableName]: {...subject.trainables[trainableName], value: value - modifiers }
        }
      } as T;
    })
  };
}