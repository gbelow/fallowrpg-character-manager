import { Character, Characteristics, Lens, Movement, Skills, Trainable, Trainables } from "../../types";
import { getAGI, getAwareness, getCharisma, getCON, getConviction1, getConviction2, getDevotion, getDEX, getINT, getMelee, getRanged, getSorcery, getSPI, getSTA, getSTR } from "./characteristics";
import { makeInvertingLens, makeTrainableValueLens } from "./factories";
import { getSize, getTGH } from "./misc";
import { getBasicMovement, getCarefulMovement, getCrawlMovement, getFastSwimMovement, getJumpMovement, getRunMovement, getStandMovement, getSwimMovement, makeMovementLens } from "./movement";
import {
  getStrike, getAccuracy, getDefend, getReflex, getGrapple, getCunning, getSD,
  getBalance, getClimb, getSwim, getPrestidigitation, getHealth, 
  getExplore, getWill,
  getCombustion, getEletromag, getRadiation, getEntropy, getBiomancy, getTelepathy, getAnimancy,
  getStealth,
  getPersuasion,
  getInsight,
  getDeception,
  getDetection,
} from "./skills";

export const skillLenses: Record<keyof Skills, Lens<Character, number>> = {
  strike: makeTrainableValueLens("strike", getStrike),
  accuracy: makeTrainableValueLens("accuracy", getAccuracy),
  defend: makeTrainableValueLens("defend", getDefend),
  reflex: makeTrainableValueLens("reflex", getReflex),
  grapple: makeTrainableValueLens("grapple", getGrapple),
  cunning: makeTrainableValueLens("cunning", getCunning),
  SD: makeTrainableValueLens("SD", getSD),
  balance: makeTrainableValueLens("balance", getBalance),
  climb: makeTrainableValueLens("climb", getClimb),
  swim: makeTrainableValueLens("swim", getSwim),
  detection: makeTrainableValueLens("detection", getDetection),
  stealth: makeTrainableValueLens("stealth", getStealth),
  prestidigitation: makeTrainableValueLens("prestidigitation", getPrestidigitation),
  health: makeTrainableValueLens("health", getHealth),
  // knowledge: makeTrainableValueLens("knowledge", getKnowledge),
  explore: makeTrainableValueLens("explore", getExplore),
  will: makeTrainableValueLens("will", getWill),
  persuasion: makeTrainableValueLens("persuasion", getPersuasion),
  deception: makeTrainableValueLens("deception", getDeception),
  insight: makeTrainableValueLens("insight", getInsight),
};

export const characteristicLenses: Record<keyof Characteristics, Lens<Character, number>> = {
  // size: makeTrainableValueLens("size", getSize),
  STR: makeTrainableValueLens("STR", getSTR),
  AGI: makeTrainableValueLens("AGI", getAGI),
  STA: makeTrainableValueLens("STA", getSTA),
  DEX: makeTrainableValueLens("DEX", getDEX),
  CON: makeTrainableValueLens("CON", getCON),
  INT: makeTrainableValueLens("INT", getINT),
  SPI: makeTrainableValueLens("SPI", getSPI),
  melee: makeTrainableValueLens("melee", getMelee),
  ranged: makeTrainableValueLens("ranged", getRanged),
  awareness: makeTrainableValueLens("awareness", getAwareness),
  sorcery: makeTrainableValueLens("sorcery", getSorcery),
  devotion: makeTrainableValueLens("devotion", getDevotion),
  conviction1: makeTrainableValueLens("conviction1", getConviction1),
  conviction2: makeTrainableValueLens("conviction2", getConviction2),
  charisma: makeTrainableValueLens("charisma", getCharisma),
  // TGH: makeTrainableValueLens("TGH", getTGH),
  // RES: makeTrainableValueLens("RES", getRES),
  // INS: makeTrainableValueLens("INS", getINS),
}

export const movementLenses: Record<keyof Movement, Lens<Character, number>> = {
  basic: makeMovementLens("basic", getBasicMovement),
  careful: makeMovementLens("careful", getCarefulMovement),
  stand: makeMovementLens("stand", getStandMovement),
  swim: makeMovementLens("swim", getSwimMovement),
  "fast swim": makeMovementLens("fast swim", getFastSwimMovement),
  crawl: makeMovementLens("crawl", getCrawlMovement),
  jump: makeMovementLens("jump", getJumpMovement),
  run: makeMovementLens("run", getRunMovement)
}

export const miscLenses = {
  size: makeInvertingLens("size", getSize),
  TGH: makeInvertingLens("TGH", getTGH),
}