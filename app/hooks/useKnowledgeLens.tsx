import { removeKnowledge } from "../domain/character/commands";
import { knowledgesLens, makeKnowledgeLens } from "../domain/character/lenses/knowledge";
import { Knowledges } from "../domain/types";
import { useActiveCharacter } from "./useActiveCharacter";

export function useKnowledgeLens() {
  const { character, update } = useActiveCharacter();

  const knowledges: Knowledges = character ? knowledgesLens.get(character) : {};

  const getValue = (name: string) => character ? makeKnowledgeLens(name).get(character) : 0;

  const setValue = (name: string, value: number) => {
    update((c) => makeKnowledgeLens(name).set(c, value));
  };

  const remove = (name: string) => {
    update(removeKnowledge(name));
  };

  return { knowledges, getValue, setValue, remove } as const;
}
