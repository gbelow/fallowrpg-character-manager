import { Character, Lens, Sense, Senses } from "../../types";
import { composeLens, makePropLens } from "./factories";

export const sensesLens: Lens<Character, Senses> = makePropLens<Character, "senses">("senses");

export function makeSenseEntryLens(senseName: keyof Senses): Lens<Character, Sense> {
  return composeLens(sensesLens, makePropLens<Senses, keyof Senses>(senseName));
}

export function makeSenseRangePenaltyLens(senseName: keyof Senses): Lens<Character, number> {
  return composeLens(makeSenseEntryLens(senseName), makePropLens<Sense, "rangePenalty">("rangePenalty"));
}

export function makeSenseBonusLens(senseName: keyof Senses): Lens<Character, number> {
  return composeLens(makeSenseEntryLens(senseName), makePropLens<Sense, "bonus">("bonus"));
}

export function makeSenseActiveLens(senseName: keyof Senses): Lens<Character, boolean> {
  return composeLens(makeSenseEntryLens(senseName), makePropLens<Sense, "active">("active"));
}

export function makeSenseHasSenseLens(senseName: keyof Senses): Lens<Character, boolean> {
  return composeLens(makeSenseEntryLens(senseName), makePropLens<Sense, "hasSense">("hasSense"));
}
