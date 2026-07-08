import { Character } from "../../types";
import { getMentalAfflictionPenalty } from "./afflictions";
import { getSorcery } from "./characteristics";
import { makeKnowledgeLens } from "./knowledge";


export function getAlchemy(c: Character): number {
  return(
    getSorcery(c) +
    (makeKnowledgeLens('alchemy').get(c) ?? 0) -
    getMentalAfflictionPenalty(c)
  )
}

export function getAnimancy(c: Character): number {
  return(
    getSorcery(c) +
    (makeKnowledgeLens('animancy').get(c) ?? 0) -
    getMentalAfflictionPenalty(c)
  )
}

export function getBiomancy(c: Character): number {
  return(
    getSorcery(c) +
    (makeKnowledgeLens('biomancy').get(c) ?? 0) -
    getMentalAfflictionPenalty(c)
  )
}

export function getDivine(c: Character): number {
  return(
    getSorcery(c) +
    (makeKnowledgeLens('devotion').get(c) ?? 0) -
    getMentalAfflictionPenalty(c)
  )
}

export function getMiracle(c: Character): number {
  return(
    2 * (makeKnowledgeLens('miracles').get(c) ?? 0) -
    getMentalAfflictionPenalty(c)
  )
}