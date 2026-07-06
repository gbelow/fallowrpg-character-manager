import { miscLenses } from "../domain/character/lenses";
import { useActiveCharacter } from "./useActiveCharacter";

export function useActiveCharacterDataLens(prop: 'size' | 'TGH') {
  
  const lens = miscLenses[prop]

  const { character, update } = useActiveCharacter();

  // Selector optimization: Only re-renders if the Lens output changes,
  // regardless of which store triggered the update.
  const value = character ? lens.get(character) : 0;

  const setValue = (newValue: number) => {
    
    update((c) => lens.set(c, newValue));
  };

  return [value, setValue] as const;
}