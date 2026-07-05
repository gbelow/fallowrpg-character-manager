import { createStore } from "zustand/vanilla";
import { toast } from "sonner";
import { getBasicCharList, getCharacterList, JsonObject } from "../actions";
import { useContext } from "react";
import { AppStoreContext } from "./appStoreProvider";
import { useStore } from "zustand";

type GameTabs = 'edit' | 'play' | 'break'

export interface AppState {
  selectedGameTab: GameTabs
  setSelectedGameTab: (mode: GameTabs) => void
  baseCharacterList: JsonObject
  updateBaseCharacterList: () => void
  playerCharacterList: {id: string, name: string}[]
  updatePlayerCharacterList: () => void  
}

export const createAppStore = (initialState: Partial<AppState>) =>
  createStore<AppState>((set) => ({
    selectedGameTab: 'edit',
    baseCharacterList: initialState.baseCharacterList || {},
    playerCharacterList: initialState.playerCharacterList || [],
    
    setSelectedGameTab: (selectedGameTab) => set({ selectedGameTab }),
    
    updateBaseCharacterList: async () => {
      const res = await getBasicCharList()
      if (!res.ok) { toast.error(res.error); return }
      set(s=> ({...s, baseCharacterList: res.data}) )
    },

    updatePlayerCharacterList: async () => {
      const res = await getCharacterList()
      if (!res.ok) { toast.error(res.error); return }
      set(s=> ({...s, playerCharacterList: res.data}) )
    },

  })
);

export function useAppStore<T>(selector: (state: AppState) => T) {
  const store = useContext(AppStoreContext);
  if (!store) throw new Error("Missing AppStoreProvider");
  return useStore(store, selector);
}