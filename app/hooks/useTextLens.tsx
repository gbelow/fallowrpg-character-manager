import { makePropLens } from "../domain/character/lenses/factories";
import { Character, Lens } from "../domain/types";
import { useActiveCharacterSelector, useActiveCharacterUpdate } from "./useActiveCharacterSelector";

export function useTextLens(keyName: 'name' | 'notes') {
  const lens: Lens<Character, string> = makePropLens(keyName);
  const update = useActiveCharacterUpdate();

  // Select the string inside the store selector so re-renders are gated on the
  // value, not the whole-character reference.
  const value = useActiveCharacterSelector((c: Character) => lens.get(c)) ?? '';

  const setValue = (newValue: string) => {
    update((c) => lens.set(c, newValue));
  };

  return [value, setValue] as const;
}
