import { Character, Lens, Skills } from '../../types'
import { getSM, skill } from './helpers'
import { getAfflictionPenalty, getAfflictions } from './afflictions'
import { getAGI, getMelee, getRanged, getAwareness, getSorcery, getSTR, getCharisma, getSPI, getDEX, getCON } from './characteristics'


export function getStrike(c: Character) {
  return getMelee(c) + skill(c, 'strike').value - getAfflictionPenalty(c, 'strike')
}

export function getAccuracy(c: Character) {
  return (
    getRanged(c) -
    3 * c.hasGauntlets +
    skill(c, 'accuracy').value -
    getAfflictionPenalty(c, 'accuracy')
  )
}

export function getDefend(c: Character) {
  return getMelee(c) + skill(c, 'defend').value  - getAfflictionPenalty(c, 'defend')
}

export function getReflex(c: Character) {
  const SM = getSM(c)
  return (
    getAwareness(c) +
    getRanged(c) -
    3 * c.hasHelm -
    SM +
    skill(c, 'reflex').value -
    getAfflictionPenalty(c, 'reflex')
  )
}

export function getGrapple(c: Character) {
  const SM = getSM(c)
  return (
    skill(c, 'grapple').value  +
    getSTR(c) - 10 +
    5 * SM +
    getMelee(c) -
    getAfflictionPenalty(c, 'grapple')
  )
}

export function getCunning(c: Character) {
  return (
    skill(c, 'cunning').value +
    getAwareness(c) -
    getAfflictionPenalty(c, 'cunning')
  )
}

export function getSD(c: Character) {
  const SM = getSM(c)
  return -2 - SM + skill(c, 'SD').value - (getAfflictions(c).includes('immobile') ? +3 : 0)
}

export function getBalance(c: Character) {
  return (
    getAGI(c) -
    10 +
    skill(c, 'balance').value -
    getAfflictionPenalty(c, 'balance')
  )
}

export function getClimb(c: Character) {
  const SM = getSM(c)
  return (
    getAGI(c) -
    10 +
    skill(c, 'climb').value -
    2 * SM -
    3 * c.hasGauntlets -
    getAfflictionPenalty(c, 'climb')
  )
}

export function getSwim(c: Character) {
  return (
    getAGI(c) -
    10 +
    skill(c, 'swim').value -
    3 * c.hasHelm -
    getAfflictionPenalty(c, 'swim')
  )
}

export function getDetection(c: Character) {
  return (
    skill(c, 'detection').value +
    2*getAwareness(c) +
    3 * c.hasHelm -
    getAfflictionPenalty(c, 'detection')
  )
}

export function getStealth(c: Character) {
  const SM = getSM(c)
  return (
    skill(c, 'stealth').value -
    3 * SM -
    getAfflictionPenalty(c, 'stealth')
  )
}

export function getPrestidigitation(c: Character) {
  return (
    getDEX(c) -
    3 * c.hasGauntlets +
    skill(c, 'prestidigitation').value -
    getAfflictionPenalty(c, 'prestidigitation')
  )
}

export function getHealth(c: Character) {
  return getCON(c)
   + skill(c, 'health').value - getAfflictionPenalty(c, 'health')
}

// export function getKnowledge(c: Character) {
//   return (
//     2 * c.characteristics.INT +
//     skill(c, 'knowledge').value -
//     getAfflictionPenalty(c, 'knowledge')
//   )
// }

export function getExplore(c: Character) {
  return (
    getAwareness(c) +
    skill(c, 'explore').value -
    getAfflictionPenalty(c, 'explore')
  )
}

export function getWill(c: Character) {
  return skill(c, 'will').value + getSPI(c) - getAfflictionPenalty(c, 'will')
}

export function getPersuasion(c: Character) {
  return getCharisma(c) + skill(c, 'persuasion').value - getAfflictionPenalty(c, 'persuasion')
}

export function getDeception(c: Character) {
  return getCharisma(c) + skill(c, 'deception').value - getAfflictionPenalty(c, 'deception')
}

export function getInsight(c: Character) {
  return getCharisma(c) + skill(c, 'insight').value - getAfflictionPenalty(c, 'insight')
}

const magic =
  (school: string) =>
  (c: Character) =>
    getSorcery(c) +
    skill(c, school as keyof Skills).value -
    getAfflictionPenalty(c, school as keyof Skills)

export const getCombustion = magic('combustion')
export const getEletromag = magic('eletromag')
export const getRadiation = magic('radiation')
export const getEntropy = magic('entropy')
export const getBiomancy = magic('biomancy')
export const getTelepathy = magic('telepathy')
export const getAnimancy = magic('animancy')