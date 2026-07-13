import { skillLenses, skillTermGetters, Term } from "../domain/character/lenses";
import { Skills } from "../domain/types";
import { useCharacterStore } from "../stores/useCharacterStore";
import { useActiveCharacter } from "./useActiveCharacter";

export function useSkillLens(skillName: keyof Skills) {
  const lens = skillLenses[skillName];
  const { character, update } = useActiveCharacter();

  // Selector optimization: Only re-renders if the Lens output changes,
  // regardless of which store triggered the update.
  const value = character ? lens.get(character) : 0;

  // Per-term breakdown for the tooltip. Shares the same character read as
  // `value`; `?.` guards against keys not in the registry (e.g. magic schools).
  const terms: Term[] = character ? skillTermGetters[skillName]?.(character) ?? [] : [];

  const setValue = (newValue: number) => {
    update((c) => lens.set(c, newValue));
  };

  return [value, setValue, terms] as const;
}
