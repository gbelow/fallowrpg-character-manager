import { useState } from "react";
import { PlayPanel } from "./PlayPanel";
import { useCombatStore } from "../stores/useCombatStore";
import { useAppStore } from "../stores/useAppStore";


export function BreakMe(){

  const [numPanels, setNumPanels] = useState(1)
  const  addCharacter = useCombatStore((state) => state.loadCharacter)
  const { baseCharacterList, updateBaseCharacterList, playerCharacterList, updatePlayerCharacterList } = useAppStore((s)=> s )
  const [renders, setRerenders] = useState(0)

  const loadRandomCharacters = (n: number) => {
    const randomChars = Object.values(baseCharacterList)
      .filter(el => el !== null && typeof el === 'object')
      .map(el => Object.values(el as object))
      .flat()
      .filter(el => el !== null && typeof el === 'object')
      .map(el => Object.values(el as object))
      .flat()

    for(let i = 0; i < n; i++){
      const randomChar = randomChars[Math.floor(Math.random() * randomChars.length)]
      if(randomChar) addCharacter(randomChar)
    }
  }
  return(
    <div className="py-2">
      <input type={'button'} className='text-center hover:bg-gray-500 p-1 font-bold' value={'Load Random Characters'} aria-label={'random_char'} onClick={() => loadRandomCharacters(10)}/>
      <div className="flex flex-row text-center content-center justify-center w-full gap-2 mt-2 mb-4">
        <span>Number of Panels:</span>
        <input type={'number'} className='text-center hover:bg-gray-500 p-1 font-bold' value={numPanels} aria-label={'add_panel'} onChange={(e) => setNumPanels(parseInt(e.target.value) || 1)}/>
      </div>
      <span className="text-center block mb-2">Renders: {renders}</span>
      {
        new Array(numPanels).fill(0).map((_, i) => (
          <PlayPanel key={i} />
        ))
      }
    </div>
  )
}