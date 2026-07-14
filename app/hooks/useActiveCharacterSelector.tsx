import { CampaignCharacter, Character } from "../domain/types";
import { useAppStore } from "../stores/useAppStore";
import { useCharacterStore } from "../stores/useCharacterStore";
import { useCombatStore } from "../stores/useCombatStore";

type CharacterUpdater = (c: Character) => Character;
type CampaignUpdater = (c: CampaignCharacter) => CampaignCharacter;

// Read side: select a derived value off the active character *inside* the
// Zustand selector, so the store gates re-renders on the computed output
// (Object.is by default) rather than on the whole-character reference. This is
// what stops a one-field mutation from re-rendering every subscriber: lens.get
// runs on every store change, but only changed outputs trigger a render.
//
// The edit and combat stores are both subscribed (no conditional hook calls),
// and the active tab picks which result is used. The idle store's selector only
// fires on its own changes; while it returns a stable value it forces no render.
// Pass a useShallow-wrapped selector for non-primitive results (arrays, etc.)
// so a fresh allocation doesn't defeat Object.is.
export function useActiveCharacterSelector<T>(
  sel: (c: Character) => T,
): T | null {
  const tab = useAppStore((s) => s.selectedGameTab);
  const editVal = useCharacterStore((s) => (s.character ? sel(s.character) : null));
  const combatVal = useCombatStore((s) => {
    const id = s.activeCharacterId;
    if (!id) return null;
    const c = s.characters[id];
    return c ? sel(c) : null;
  });
  return tab === "edit" ? editVal : combatVal;
}

// Non-reactive snapshot of the active character — for deriving display-only
// values (e.g. tooltip term breakdowns) WITHOUT subscribing. A caller that
// wants updates must gate its own re-render reactively (via
// useActiveCharacterSelector on the derived value); this read alone does not
// trigger re-renders. Module-level stores expose getState(), so this works on
// the server too.
export function readActiveCharacter(tab: "edit" | "play" | "break"): Character | null {
  if (tab === "edit") return useCharacterStore.getState().character;
  const s = useCombatStore.getState();
  const id = s.activeCharacterId;
  return id ? (s.characters[id] ?? null) : null;
}

// Write side: the unified updater, without subscribing to the whole character.
// Selecting just the stable action refs (and the tab) avoids re-introducing the
// whole-character subscription that useActiveCharacter carries on its read path.
export function useActiveCharacterUpdate() {
  const tab = useAppStore((s) => s.selectedGameTab);
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);
  const updateCombatActive = useCombatStore((s) => s.updateActiveCharacter);

  function update(updater: CharacterUpdater): Character | undefined;
  function update(updater: CampaignUpdater): CampaignCharacter | undefined;
  function update(updater: CharacterUpdater | CampaignUpdater) {
    if (tab === "edit") return updateCharacter(updater as CharacterUpdater);
    return updateCombatActive(updater as CampaignUpdater);
  }
  return update;
}
