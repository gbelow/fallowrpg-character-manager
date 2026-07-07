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

function makeInvertingSetter<T extends Character>(
  getter: (c: T) => number,
  readBase: (c: T) => number,
  writeBase: (c: T, base: number) => T,
): (subject: T, value: number) => T {
  return (subject: T, value: number): T => {
    const modifiers = getter(subject) - readBase(subject);
    return writeBase(subject, value - modifiers);
  };
}


export function makeSimpleLens<T extends Character> (
  propertyName: 'size' | 'TGH', 
  getter: (c: T) => number, 
  setter?: (c: T, value: number) => T): Lens<T, number> {
  return {
    get: getter,
    set: setter ?? makeInvertingSetter(
      getter,
      (c: T) => c[propertyName],
      (c: T, base: number) => ({ ...c, [propertyName]: base }) as T
    )
  };
}

export function makeTrainableNameLens<T extends Character>(
  trainableName: keyof Trainables
): Lens<T, string> {
  return {
    get: (c: T) => c.trainables[trainableName].name,
    set: (c: T, value: string) => ({
      ...c,
      trainables: {
        ...c.trainables,
        [trainableName]: { ...c.trainables[trainableName], name: value }
      }
    }) as T
  };
}

export function makeTrainableValueLens<T extends Character>(
  trainableName: keyof Trainables,
  getter: (c: T) => number,
  setter?: (c: T, value: number) => T
): Lens<T, number> {
  return {
    get: getter,
    set: setter ?? makeInvertingSetter(
      getter,
      (c: T) => c.trainables[trainableName].value ?? 0,
      (c: T, base: number) => ({
        ...c,
        trainables: {
          ...c.trainables,
          [trainableName]: { ...c.trainables[trainableName], value: base }
        }
      }) as T
    )
  };
}