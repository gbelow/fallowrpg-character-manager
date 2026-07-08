import { makeTrainableNameLens } from "../domain/character/lenses/factories";
import { Character, Trainables } from "../domain/types";
import { useActiveCharacter } from "./useActiveCharacter";

export function useTrainableNameLens(trainableName: keyof Trainables) {
  const lens = makeTrainableNameLens<Character>(trainableName);
  const { character, update } = useActiveCharacter();

  const value = character ? lens.get(character) : '';
  // console.log(character, trainableName, value)

  const setValue = (newValue: string) => {
    update((c) => lens.set(c, newValue));
  };

  return [value, setValue] as const;
}
