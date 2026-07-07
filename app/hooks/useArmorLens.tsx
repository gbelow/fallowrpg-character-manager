import { equipArmor } from "../domain/character/commands";
import { makeTextLens } from "../domain/character/lenses/factories";
import { Armor, ArmorSchema, Character, Skills } from "../domain/types";
import { useActiveCharacter } from "./useActiveCharacter";

export function useArmorLens() {
  const { character, update } = useActiveCharacter();

  const value = character?.armor ? character.armor : ArmorSchema.parse({});

  const setValue = (newValue: Armor) => {
    update(equipArmor(newValue));
  };

  return [value, setValue] as const;
}