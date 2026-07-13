import { characteristicLenses, characteristicTermGetters, Term } from "../domain/character/lenses";
import { Characteristics } from "../domain/types";
import { useActiveCharacter } from "./useActiveCharacter";

export function useCharacteristicLens(characteristicName: keyof Characteristics) {
  const lens = characteristicLenses[characteristicName];
  const { character, update } = useActiveCharacter();

  // Selector optimization: Only re-renders if the Lens output changes,
  // regardless of which store triggered the update.
  const value = character ? lens.get(character) : 0;

  // Per-term breakdown for the tooltip (only derived characteristics like
  // STR/AGI/STA have one). `?.` guards characteristics without a term getter.
  const terms: Term[] = character ? characteristicTermGetters[characteristicName]?.(character) ?? [] : [];

  const setValue = (newValue: number) => {

    update((c) => lens.set(c, newValue));
  };

  return [value, setValue, terms] as const;
}
