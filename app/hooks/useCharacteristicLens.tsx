import { characteristicLenses, characteristicTermGetters, Term } from "../domain/character/lenses";
import { Character, Characteristics } from "../domain/types";
import { useAppStore } from "../stores/useAppStore";
import { readActiveCharacter, useActiveCharacterSelector, useActiveCharacterUpdate } from "./useActiveCharacterSelector";

export function useCharacteristicLens(characteristicName: keyof Characteristics) {
  const lens = characteristicLenses[characteristicName];
  const update = useActiveCharacterUpdate();
  const tab = useAppStore((s) => s.selectedGameTab);

  // Select the derived value INSIDE the store selector so re-renders are gated
  // on the computed output (Object.is), not the whole-character reference.
  const value = useActiveCharacterSelector((c: Character) => lens.get(c)) ?? 0;

  // Per-term breakdown (only derived characteristics like STR/AGI/STA have one).
  // Derived non-reactively — see useSkillLens for why term arrays can't go
  // through the store selector. Gated on `value`.
  const active = readActiveCharacter(tab);
  const terms: Term[] = active ? (characteristicTermGetters[characteristicName]?.(active) ?? []) : [];

  const setValue = (newValue: number) => {
    update((c) => lens.set(c, newValue));
  };

  return [value, setValue, terms] as const;
}
