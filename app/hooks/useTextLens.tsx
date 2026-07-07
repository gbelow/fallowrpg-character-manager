import { propLens } from "../domain/character/lenses/factories";
import { Character, Lens } from "../domain/types";
import { useActiveCharacter } from "./useActiveCharacter";

export function useTextLens(keyName: 'name' | 'notes') {
  const lens : Lens<Character, string> = propLens(keyName);
  const { character, update } = useActiveCharacter();

  const value = character ? lens.get(character) : '';

  const setValue = (newValue: string) => {
    update((c) => lens.set(c, newValue));
  };

  return [value, setValue] as const;
}