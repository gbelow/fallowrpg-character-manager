import { Character, Weapon } from "../../types";
import { getBurdenPenalty } from "../../item/lenses/containers";

export function getGearPenalties(c: Character){
  const pen = c.armor.penalty +
  Object.values(c.weapons).reduce((acc: number, weapon: Weapon) => acc + weapon.penalty, 0) +
  getBurdenPenalty(c)

  return pen
}

