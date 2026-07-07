import { composeLens, propLens } from "../domain/character/lenses/factories";
import { Character, Trainable, Trainables } from "../domain/types";
import { useActiveCharacter } from "./useActiveCharacter";

export function useTrainableNameLens(trainableName: keyof Trainables) {
  const lens = composeLens(
    propLens<Character, 'trainables'>('trainables'), 
    propLens<Trainables, keyof Trainables>(trainableName), 
    propLens<Trainable, 'name'>('name')
  );
  const { character, update } = useActiveCharacter();

  const value = character ? lens.get(character) : '';
  // console.log(character, trainableName, value)

  const setValue = (newValue: string) => {
    update((c) => lens.set(c, newValue));
  };

  return [value, setValue] as const;
}
