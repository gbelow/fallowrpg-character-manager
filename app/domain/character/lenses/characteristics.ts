import { CampaignCharacter, Character, Lens } from "../../types"
import { getGearPenalties } from "./gear"
import { getDM } from "./helpers"

export function makeCharacteristicLens<T extends Character>(
  characteristicName: keyof Character['characteristics'], 
  getter: (c: T) => number, 
  setter?: (c: T, value: number) => T,
)
  : Lens<T, number> {
    return {
      get: getter,
      set: setter ?? ((subject: T, value: number): T => {
        const modifiers = getter(subject) - subject.characteristics[characteristicName]
        const candidate = { ...subject, characteristics: {
          ...subject.characteristics, [characteristicName]: value - modifiers,
        }} as T
        const normalized = getter(candidate) - modifiers
        return { ...subject, characteristics: {
          ...subject.characteristics, [characteristicName]: normalized,
        }} as T
      })
    } 
}

export function getSTR(c: Character): number {
  return c.characteristics.STR
}

export function getAGI(c: Character): number {
  return c.characteristics.AGI - getGearPenalties(c) 
}

export function getSTA(c: Character): number {
  return c.characteristics.STA - getGearPenalties(c) 
}

export const getCON = (c: Character) => c.characteristics.CON
export const getINT = (c: Character) => c.characteristics.INT
export const getSPI = (c: Character) => c.characteristics.SPI
export const getDEX = (c: Character) => c.characteristics.DEX

export const getSize = (c: Character) => c.characteristics.size > 6 ? 7 : c.characteristics.size < 2 ? 1 : c.characteristics.size

export const getMelee = (c: Character) => c.characteristics.melee
export const getRanged = (c: Character) => c.characteristics.ranged
export const getAwareness = (c: Character) => c.characteristics.awareness
export const getSorcery = (c: Character) => c.characteristics.sorcery
export const getConviction1 = (c: Character) => c.characteristics.conviction1
export const getConviction2 = (c: Character) => c.characteristics.conviction2
export const getCharisma = (c: Character) => c.characteristics.charisma


export const getTGH = (c: Character) => Math.floor(0.5 * getSTR(c) * getDM(c) + c.characteristics.TGH)
