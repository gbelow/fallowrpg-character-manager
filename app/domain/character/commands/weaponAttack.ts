import { getSTR } from "../lenses/characteristics"
import { dmgArr } from "../../tables"
import { CampaignCharacter, Character, WeaponAttack } from "../../types"
import { updateSTA } from "./bleed"

export type AttackVariant = {
  type: string
  name: string
  AP: number
  STA:number
  penalty: number
  blunt: number
  cut: number
}

export function getAttacksList ({atk} : {atk: WeaponAttack }) : (c: Character) => AttackVariant[] {
  const props = atk.properties.split(',').filter(el => ["heavy I", "heavy II", "heavy III", "heavy I-III", "heavy I-II", "braced", "hook", "fast"].includes(el.trim())).map(el => el.trim())

  return((c:Character) => {
    const STR = getSTR(c)

    const basic = {name: 'basic', type: 'melee', AP: atk.AP, STA:0, penalty: 0, blunt: atk.energy, cut: atk.energy*atk.SHP  }
    const heavyI = {name: 'heavyI', type: 'melee', AP: atk.AP+1, STA:0, penalty: 0, blunt: atk.energy+ Math.floor(STR/2), cut: atk.energy+ Math.floor(atk.SHP*STR/2)}
    const heavyII = {name: 'heavyII', type: 'melee', AP: atk.AP+2, STA:1, penalty: 2, blunt: atk.energy+ Math.floor(STR), cut: atk.energy+ Math.floor(atk.SHP*STR)}
    const heavyIII = {name: 'heavyIII', type: 'melee', AP: atk.AP+3, STA:1, penalty: 3, blunt: atk.energy+ Math.floor(3*STR/2), cut: atk.energy+ Math.floor(atk.SHP*3*STR/2)}
    const braced = {name: 'braced', type: 'melee', AP: atk.AP+2, STA:1, penalty: 0, blunt: atk.energy+ Math.floor(STR), cut: atk.energy+ Math.floor(atk.SHP*STR) }
    const hook = {name: 'hook', type: 'melee', AP: atk.AP, STA:0, penalty: 0, blunt: atk.energy, cut: atk.energy*atk.SHP  }
    const quickShot = {name: 'quick', type: 'ranged', AP: atk.AP, STA:0, penalty: 3, blunt: atk.energy, cut: atk.energy*atk.SHP  }
    const snipe = {name: 'snipe', type: 'ranged', AP: atk.AP+2, STA:0, penalty: 0, blunt: atk.energy, cut: atk.energy*atk.SHP  }

    const attacks = []
    if(!props.includes('heavy I-III') && !props.includes('heavy I-II') ) attacks.push(basic)
    if(props.includes('heavy I')) attacks.push(heavyI)
    if(props.includes('heavy II')) attacks.push(heavyI, heavyII)
    if(props.includes('heavy III')) attacks.push(heavyI, heavyII, heavyIII)
    if(props.includes('heavy I-II')) attacks.push(heavyI, heavyII)
    if(props.includes('heavy I-III')) attacks.push(heavyI, heavyII, heavyIII)
    if(props.includes('braced')) attacks.push(braced)
    if(props.includes('hook')) attacks.push(hook)
    if(props.includes('fast')) attacks.push(quickShot, snipe)  

    return attacks
  })  
}

export function spendAttackResources (atk: AttackVariant) {
  return((c: CampaignCharacter) => {
    if(c.resources.AP < atk.AP) return c
    if(atk.STA > c.resources.STA) return c

    const newChar = updateSTA(c.resources.STA - atk.STA)(c) 
    return {...newChar, resources: {...newChar.resources, AP: newChar.resources.AP - atk.AP}}
  })
}


// Pure: the caller supplies the already-rolled value, so this stays
// deterministic. The rng seam lives in the integration layer (useWeaponLens).
export function getAttackValues (atk: AttackVariant , type: string, weapon: string, roll: number) {
  return((c: Character) => {
    let val = roll - atk.penalty
    if(type=='ranged') val += c.skills.accuracy
    if(type=='melee') val += c.skills.strike

    return{atk: val, type: type, weapon, blunt: atk.blunt, cut: atk.cut}
  })
}

export function parseModdedValue (value: number, mod: number) {
  if(mod === 0) return value
    return Math.floor(value + mod*1)
}

export function parseAtkDamage (atk: WeaponAttack, scale: number, component: string) {
  const energy = parseModdedValue(atk.energy, atk.STRmod)
  const dmgScale = dmgArr[scale-1]
  const value = 
  component === "blunt" ? energy*dmgScale /*+(atk.heavyMod ? '+' + Math.floor(atk.heavyMod*STR*dmgScale) : '' )*/ :
  component === "cutting" ? Math.floor(energy*atk.SHP*dmgScale) /*+ (atk.heavyMod ? '+'+ Math.floor(atk.heavyMod*atk.SHP*STR*dmgScale) : '')*/ : 0
  // component === "force" ? Math.floor(energy*atk.forceMod*dmgScale) /*+(atk.heavyMod ? '+'+ Math.floor(atk.heavyMod*atk.forceMod*STR*dmgScale) : '')*/ : 0

  return(value)
}

