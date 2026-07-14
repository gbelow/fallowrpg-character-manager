import { addKnowledge, removeKnowledge } from "../domain/character/commands";
import { knowledgesLens, makeKnowledgeLens } from "../domain/character/lenses/knowledge";
import { Character, Knowledges } from "../domain/types";
import { useAppStore } from "../stores/useAppStore";
import { readActiveCharacter, useActiveCharacterSelector, useActiveCharacterUpdate } from "./useActiveCharacterSelector";

export function useKnowledgeLens() {
  const update = useActiveCharacterUpdate();
  const tab = useAppStore((s) => s.selectedGameTab);

  // knowledges is a state-held object ref — Object.is gates re-renders to
  // actual knowledges changes (setters produce a new ref via structural sharing).
  const knowledges: Knowledges =
    useActiveCharacterSelector((c: Character) => knowledgesLens.get(c)) ?? ({} as Knowledges);

  // Non-reactive read for per-entry lookups; the knowledges ref above gates
  // re-renders, so this stays fresh when a knowledge value changes.
  const getValue = (name: string) => {
    const c = readActiveCharacter(tab);
    return c ? makeKnowledgeLens(name).get(c) : 0;
  };

  const setValue = (name: string, value: number) => {
    update((c) => makeKnowledgeLens(name).set(c, value));
  };

  const add = (name: string) => {
    update(addKnowledge(name));
  };

  const remove = (name: string) => {
    update(removeKnowledge(name));
  };

  return { knowledges, getValue, setValue, add, remove } as const;
}
