import { equipWeapon, getCharacterWeapons, unequipWeapon } from "../domain/character/commands/equipWeapon";
import { AttackVariant, getAttacksList, getAttackValues, spendAttackResources } from "../domain/character/commands/weaponAttack";
import { Weapon, WeaponAttack } from "../domain/types";
import { isCampaignCharacter } from "../domain/utils";
import { rollFull } from "../domain/combat/dice";
import { useActiveCharacter } from "./useActiveCharacter";

export function useWeaponLens() {
  const { character, update } = useActiveCharacter();

  const weapons: Record<string, Weapon> = getCharacterWeapons(character)

  const equip = (newValue: Weapon) => {
    update(equipWeapon(newValue));
  };

  const unequip = (weaponKey: string) => {
    update(unequipWeapon(weaponKey));
  };

  const attack = (atk: AttackVariant, type: string, weapon: string) => {
    if(!character || !isCampaignCharacter(character)) return;
    const newCharacter = update( spendAttackResources(atk));
    if(!newCharacter ) return;
    const roll = rollFull(Math.random)
    return getAttackValues(atk, type, weapon, roll)(newCharacter)
  }

  const getVariantsList = (atk: WeaponAttack) => {
    if(!character) return
    return getAttacksList({atk})(character)
  }
    

  return {weapons, equip, unequip, attack, getVariantsList} as const;
}
