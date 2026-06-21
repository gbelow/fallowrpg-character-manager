import { makeTextLens } from "../domain/character/lenses/factories";
import { Character, Skills } from "../domain/types";
import { useActiveCharacter } from "./useActiveCharacter";

export function useTextLens(keyName: keyof Character) {
  const lens = makeTextLens(keyName);
  const { character, update } = useActiveCharacter();

  const value = character ? lens.get(character) : '';

  const setValue = (newValue: string) => {
    update((c) => lens.set(c, newValue));
  };

  return [value, setValue] as const;
}