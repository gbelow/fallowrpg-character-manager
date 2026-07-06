import { Character } from "../../types"
import { getGearPenalties } from "./gear"


export function getSTR(c: Character): number {
  return c.trainables.STR.value
}

export function getAGI(c: Character): number {
  return c.trainables.AGI.value - getGearPenalties(c) 
}

export function getSTA(c: Character): number {
  return c.trainables.STA.value - getGearPenalties(c) 
}

export const getCON = (c: Character) => c.trainables.CON.value
export const getINT = (c: Character) => c.trainables.INT.value
export const getSPI = (c: Character) => c.trainables.SPI.value
export const getDEX = (c: Character) => c.trainables.DEX.value

export const getMelee = (c: Character) => c.trainables.melee.value
export const getRanged = (c: Character) => c.trainables.ranged.value
export const getAwareness = (c: Character) => c.trainables.awareness.value
export const getSorcery = (c: Character) => c.trainables.sorcery.value
export const getConviction1 = (c: Character) => c.trainables.conviction1.value
export const getConviction2 = (c: Character) => c.trainables.conviction2.value
export const getCharisma = (c: Character) => c.trainables.charisma.value
export const getDevotion = (c: Character) => c.trainables.devotion.value
