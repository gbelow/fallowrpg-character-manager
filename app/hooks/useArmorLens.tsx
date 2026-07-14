import { equipArmor } from "../domain/character/commands";
import { Armor, ArmorSchema, Character } from "../domain/types";
import { useActiveCharacterSelector, useActiveCharacterUpdate } from "./useActiveCharacterSelector";

// Stable default for the no-active-character case.
const DEFAULT_ARMOR: Armor = ArmorSchema.parse({});

export function useArmorLens() {
  const update = useActiveCharacterUpdate();

  // armor is a state-held object ref — Object.is gates re-renders to actual
  // armor changes (equipArmor produces a new ref via structural sharing).
  const value: Armor =
    useActiveCharacterSelector((c: Character) => c.armor) ?? DEFAULT_ARMOR;

  const setValue = (newValue: Armor) => {
    update(equipArmor(newValue));
  };

  return [value, setValue] as const;
}
