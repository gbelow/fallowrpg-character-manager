'use client'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import armors from './assets/armors.json'
import baseWeapons from './assets/weapons.json'
import { PlayPanel } from './components/PlayPanel';
import { CharacterCreator } from './components/CharacterCreator';
import { scaleWeapon } from './domain/character/lenses/helpers';
import { upsertBaseCharacter, deleteBaseCharacter, getCharacter, deleteCharacter, JsonObject } from './actions';
import { useAppStore } from './stores/useAppStore';
import { makeCharacter } from './domain/factories';
import { groupByTags, TreeNode } from './domain/character/grouping';
import { Armor, BaseCharacter, Character, Weapon, WeaponSchema } from './domain/types';
import { useCharacterStore } from './stores/useCharacterStore';
import { equipArmor, equipWeapon } from './domain/character/commands';
import { useCombatStore } from './stores/useCombatStore';
import { useActiveCharacter } from './hooks/useActiveCharacter';
import { BreakMe } from './components/BreakMe';


export function ArmorSelector(){
  const {update} = useActiveCharacter()

  const handleEquipArmorClick = (armor: Armor) => {
    update( equipArmor(armor))    
  };

  return(
    <div className='text-center w-full'>
      {
        Object.values(armors as Record<string, Armor>).map((el: Armor) => {
          return(
            <input type={'button'} key={el.name} className='text-center w-full hover:bg-gray-500 p-1 ' value={el.name} aria-label={el.name} onClick={() => handleEquipArmorClick(el)}/>
          )
        })
      }
    </div>
  )
}

export function WeaponSelector(){

  const {update} = useActiveCharacter()

  const handleEquipWeaponClick = (weapon: Weapon) => {
    update( equipWeapon( weapon))
  };  

  const typedBaseWeapons : Record<string, Weapon> = Object.entries(baseWeapons).reduce((acc, w) => ({...acc, [w[0]]: (WeaponSchema.parse(w[1]))}), {});

  const [weapons, setWeapons] = useState(typedBaseWeapons)

  return(
    <div className='text-center w-full'>
      {
        Object.values(weapons).map((el:Weapon) => {
          return(
            <div className='flex flex-row justify-around text-center w-full  ' key={el.name}>
              <input type={'button'}  className='text-center  hover:bg-gray-500 p-1 w-32' value={el.name} aria-label={el.name} 
                onClick={() => el ? handleEquipWeaponClick(scaleWeapon(el, el.scale)) : null}
              />
              <input className='w-8' type='number' inputMode="numeric" aria-label={el.name} value={el.scale} 
                onChange={(val) => setWeapons({...weapons, [el.name]: {...el, scale: parseInt(val.target.value)}})} 
              />
            </div>
          )
        })
      }
    </div>
  )
}


type NodeHandlers = {
  open: { [key: string]: boolean }
  toggle: (key: string) => void
  selectedGameTab: string
  onSelect: (character: Character) => void
  onCreate: (tags: string[]) => void
  onDelete: (name: string) => void
}

function nodeKey(node: TreeNode): string {
  return node.type === 'character' ? node.character.name : node.tags.join('/')
}

// Recursive renderer over the tag-derived tree. Depth drives styling: the
// top-level group is bold/dark, nested groups lighter — but the structure is
// otherwise uniform, so it handles any tag depth.
function CharacterTreeNode({ node, depth, handlers }: {
  node: TreeNode
  depth: number
  handlers: NodeHandlers
}) {
  if (node.type === 'character') {
    return (
      <div className="flex flex-row p-1 bg-gray-600 rounded cursor-pointer hover:bg-gray-500">
        <input
          type={'button'}
          className='text-center w-full hover:bg-gray-500 p-1'
          value={node.character.name}
          aria-label={node.character.name}
          onClick={() => handlers.onSelect(node.character)}
        />
        {handlers.selectedGameTab === 'edit' ? (
          <button
            className="w-6 text-left font-semibold p-1 bg-red-500 rounded"
            onClick={() => handlers.onDelete(node.character.name)}
          >
            -
          </button>
        ) : null}
      </div>
    )
  }

  const key = node.tags.join('/')
  const isOpen = !!handlers.open[key]
  const isTop = depth === 0

  return (
    <div className="mb-2">
      <div className="flex flex-row mb-1 gap-1">
        <button
          onClick={() => handlers.toggle(key)}
          className={`w-full text-left p-1 rounded ${isTop ? 'font-bold bg-gray-800' : 'font-semibold bg-gray-700'}`}
        >
          {node.label}
        </button>
        <button
          className="w-6 text-left font-semibold p-1 bg-gray-700 rounded"
          onClick={() => handlers.onCreate(node.tags)}
        >
          +
        </button>
      </div>
      {isOpen && (
        <div className="ml-4 mt-1 space-y-1">
          {node.children.map(child => (
            <CharacterTreeNode
              key={nodeKey(child)}
              node={child}
              depth={depth + 1}
              handlers={handlers}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function CharacterSelector(){

  const [open, setOpen] = useState<{ [key: string]: boolean }>({});
  const [openCampaignChars, setOpenCampaignChars] = useState(false)
  const {selectedGameTab} = useAppStore((s)=> s)
  const  loadCharacter = useCharacterStore((state) => state.loadCharacter)
  const  addCharacter = useCombatStore((state) => state.loadCharacter)
  const { baseCharacterList, updateBaseCharacterList, playerCharacterList, updatePlayerCharacterList } = useAppStore((s)=> s )


  const handleSelectCharacterClick = (character: Character) => {
    if (selectedGameTab == 'edit') loadCharacter(character)
    if (selectedGameTab == 'play') addCharacter(character)
  };

  const handleSelectPlayerClick  = async (characterId: string) => {
    const res = await getCharacter(characterId)
    if(!res.ok){ toast.error(res.error); return }
    if(!res.data) return
    handleSelectCharacterClick(res.data)
    await updatePlayerCharacterList()
  };

  const handleDeletePlayerClick  = async (characterId: string) => {
    const res = await deleteCharacter(characterId)
    if(!res.ok){ toast.error(res.error); return }
    toast.success('Character deleted.')
    await updatePlayerCharacterList()
  };

  const toggle = (key: string) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const createCharacter = async (tags: string[]) => {
    // The name is a base character's identity on disk, so it can't be blank —
    // prompt for one. `tags` already carries the group path the `+` was clicked
    // in, so the new character lands in that folder.
    const name = window.prompt('Character name')?.trim()
    if (!name) return
    const res = await upsertBaseCharacter(makeCharacter({ name }, tags))
    if(!res.ok){ toast.error(res.error); return }
    updateBaseCharacterList()
  }

  const handleDeleteBaseCharacter = async (name: string) => {
    const res = await deleteBaseCharacter(name)
    if(!res.ok){ toast.error(res.error); return }
    updateBaseCharacterList()
  }

  // The flat list from disk is parsed through the domain factory so the sidebar
  // groups by the schema-authoritative `tags` (with defaults applied) rather
  // than trusting raw JSON shape.
  const characters = useMemo<BaseCharacter[]>(
    () => Object.values(baseCharacterList)
      .filter((v): v is JsonObject => v !== null && typeof v === 'object' && !Array.isArray(v))
      .map(v => makeCharacter(v)),
    [baseCharacterList]
  )
  const tree = useMemo(() => groupByTags(characters), [characters])

  const handlers: NodeHandlers = {
    open,
    toggle,
    selectedGameTab,
    onSelect: handleSelectCharacterClick,
    onCreate: createCharacter,
    onDelete: handleDeleteBaseCharacter,
  }

  return (
    <div className="bg-gray-900 text-white p-2">
      {
        tree.map(node => (
          <CharacterTreeNode key={nodeKey(node)} node={node} depth={0} handlers={handlers} />
        ))
      }
      {
        <div>
          <input type={'button'} key={'oplay'} className='w-full font-bold bg-gray-800 rounded hover:bg-gray-500 p-1 text-left' value={'PCs'} aria-label={'oplay'} onClick={() => setOpenCampaignChars(!openCampaignChars)}/>
          {
            openCampaignChars && playerCharacterList.sort().map(el =>
              <div
                key={el.id}
                className="flex flex-row p-1 bg-gray-600 rounded cursor-pointer hover:bg-gray-500 ml-2"
              >
                <input type={'button'} key={el.id} className='w-full text-center hover:bg-gray-500 p-1  text-left' value={el.name} aria-label={el.name} onClick={() => handleSelectPlayerClick(el.id)}/>
                <button className="w-6 text-left font-semibold p-1 bg-red-500 rounded" onClick={() => handleDeletePlayerClick(el.id)}>
                  -
                </button>
              </div>
            )
          }
        </div>
      }
    </div>
  );
}

export function Sidebar(){

  const [selectedSidebar, setSelectedSidebar] = useState('') 

  return(
    <>
      <div className='flex flex-row items-start justify-between mb-2 '>
        <input className={'p-1 w-full hover:bg-gray-500 '+ (selectedSidebar == 'Armor' ? 'bg-white text-black' : '')} type={'button'} aria-label={'sbar_armor'} value={'Armor'} onClick={() => setSelectedSidebar('Armor')}/>
        <input className={'p-1 w-full hover:bg-gray-500 '+ (selectedSidebar == 'Weapon' ? 'bg-white text-black' : '')} type={'button'} aria-label={'sbar_weapon'} value={'Weapon'} onClick={() => setSelectedSidebar('Weapon')}/>
        <input className={'p-1 w-full hover:bg-gray-500 '+ (selectedSidebar == 'Create' ? 'bg-white text-black' : '')} type={'button'} aria-label={'sbar_char'} value={'Character'} onClick={() => setSelectedSidebar('Character')}/>
      </div>
      {
        selectedSidebar == 'Armor' ?
        <ArmorSelector /> :
        selectedSidebar == 'Weapon' ?
        <WeaponSelector /> :
        selectedSidebar == 'Character' ?
        <CharacterSelector/>
        : null
      }
    </>
  )
}


export function App(){

  const {selectedGameTab, setSelectedGameTab} = useAppStore((s)=> s)

  const [open, setOpen] = useState(false)

  return(
    <>      
      <header className="py-4 h-12">
        <div className='flex flex-row justify-start items-start text-start gap-2'>
          {/* <input className={'p-1 w-full hover:bg-gray-500 '+ (selectedPage == 'Select' ? 'bg-white text-black' : '')} type={'button'} aria-label={'head_select'} value={'Select'} onClick={() => setSelectedPage('Select')}/> */}
          <input className={'py-1 rounded px-2 hover:bg-gray-500 '+ (selectedGameTab == 'edit' ? 'bg-white text-black' : '')} type={'button'} aria-label={'head_char'} value={'Character'} onClick={() => setSelectedGameTab('edit')}/>
          {/* <input className={'py-1 rounded px-2 hover:bg-gray-500 '+ (selectedPage == 'Play' ? 'bg-white text-black' : '')} type={'button'} aria-label={'head_play'} value={'Play'} onClick={() => setSelectedPage('Play')}/> */}
          <input className={'py-1 rounded px-2 hover:bg-gray-500 hidden md:block '+ (selectedGameTab == 'play' ? 'bg-white text-black' : '')} type={'button'} aria-label={'head_play'} value={'Run'} onClick={() => setSelectedGameTab('play')}/>
          <input className={'py-1 rounded px-2 hover:bg-gray-500 hidden md:block '+ (selectedGameTab == 'break' ? 'bg-white text-black' : '')} type={'button'} aria-label={'head_break'} value={'Break Me'} onClick={() => setSelectedGameTab('break')}/>
        </div>
      </header>

      <main className="grid grid-cols-12 w-full h-full">
      <div className="hidden md:block col-span-2 border pr-1 px-1 h-full">
        <Sidebar />
      </div>

      {/* mobile top menu for sidebar */}
      <div className="md:hidden flex items-center justify-between text-white p-2 h-8">
        <button
          type='button'
          onClick={() => setOpen((prev) => !prev)}
          className="focus:outline-none"
        >
          {/* Hamburger icon */}
          <div className="space-y-1">
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
          </div>
        </button>
      </div>

      {/* Mobile Sidebar */}
      {open && (
        <div className="md:hidden absolute top-0 left-0 w-64 h-full bg-gray-900 text-white shadow-lg z-50">
          <button
            onClick={() => setOpen(false)}
            className="p-2 text-right w-full"
          >
            ✕ Close
          </button>
          <Sidebar />
        </div>
      )}


      <div className="col-span-12 md:col-span-10 mr-2 md:ml-2 text-sm md:text-md justify-center text-center">
        {
          selectedGameTab == 'edit' ?
            <CharacterCreator /> :
            selectedGameTab == 'play' ?
            <PlayPanel/> :
            selectedGameTab == 'break' ?
            <BreakMe/> :
            null
        }
      </div>
      </main>
    </>
  )
}
