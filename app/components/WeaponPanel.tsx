'use client'

import { useState } from "react";
import { makeFullRoll } from "./utils";
import { dmgArr } from "../domain/tables";
import { useSkillLens } from "../hooks/useSkillLens";
import { useCharacteristicLens } from "../hooks/useCharacteristicLens";
import { useWeaponLens } from "../hooks/useWeaponLens";
import { useResourceLens } from "../hooks/useResourceLens";
import { Weapon, WeaponAttack } from "../domain/types";
import { useCharacterCommands } from "../hooks/useCharacterCommands";

type attackMod = {
  name: string
  AP: number
  STA:number
  penalty: number
  blunt: number
  cut: number
  force: number
}

export function WeaponPanel(){
  const {weapons, unequip} = useWeaponLens()
  const [STA] = useResourceLens('STA')
  const { updateSTA } = useCharacterCommands()
  const [AP, setAP] = useResourceLens('AP')  

  const [lastAtk, setLastAtk] = useState({atk:0, type: '', weapon: '', blunt: 0, cut: 0, force: 0})
  const [strike] = useSkillLens('strike')
  const [accuracy] = useSkillLens('accuracy')
  const [STR] = useCharacteristicLens('STR') ?? 10

  const pressAtk = (atk: attackMod, type: string, weapon: string,) => {
    if(AP < atk.AP) return
    if(atk.STA > STA) return
    setAP(AP-atk.AP)
    updateSTA(STA-atk.STA)

    const roll = makeFullRoll()
    let val = roll - atk.penalty
    if(type=='ranged') val += accuracy
    if(type=='melee') val += strike
    setLastAtk({atk: val, type: type, weapon, blunt: atk.blunt, cut: atk.cut, force:atk.force})
  }

  const parseModdedValue = (value: number, mod: number) => {
    if(mod === 0) return value
      return Math.floor(value + mod*STR)
  }

  const parseAtkDamage = (atk: WeaponAttack, scale: number, component: string) => {
    let energy = parseModdedValue(atk.energy, atk.STRmod)
    const dmgScale = dmgArr[scale-1]
    const value = 
    component === "blunt" ? energy /*+(atk.heavyMod ? '+' + Math.floor(atk.heavyMod*STR*dmgScale) : '' )*/ :
    component === "cutting" ? Math.floor(energy*atk.SHP) /*+ (atk.heavyMod ? '+'+ Math.floor(atk.heavyMod*atk.SHP*STR*dmgScale) : '')*/ :
    component === "force" ? Math.floor(energy*atk.forceMod) /*+(atk.heavyMod ? '+'+ Math.floor(atk.heavyMod*atk.forceMod*STR*dmgScale) : '')*/ : 0

    return(value)
  }

  const AttackButtons = ({atk, weaponName} : {atk: WeaponAttack, weaponName: string }) =>{
  const props = atk.properties.split(',').filter(el => ["heavy I", "heavy II", "heavy III", "heavy I-III", "heavy I-II", "braced", "hook", "fast"].includes(el.trim())).map(el => el.trim())
  
  const basic = {name: 'basic', AP: atk.AP, STA:0, penalty: 0, blunt: atk.energy, cut: atk.energy*atk.SHP, force: atk.energy*atk.forceMod  }
  const heavyI = {name: 'heavyI', AP: atk.AP+1, STA:0, penalty: 0, blunt: atk.energy+ Math.floor(STR/2), cut: atk.energy+ Math.floor(atk.SHP*STR/2), force: atk.energy+ Math.floor(atk.forceMod*STR/2)}
  const heavyII = {name: 'heavyII', AP: atk.AP+2, STA:0, penalty: 2, blunt: atk.energy+ Math.floor(STR), cut: atk.energy+ Math.floor(atk.SHP*STR), force: atk.energy+ Math.floor(atk.forceMod*STR)}
  const heavyIII = {name: 'heavyIII', AP: atk.AP+3, STA:0, penalty: 3, blunt: atk.energy+ Math.floor(3*STR/2), cut: atk.energy+ Math.floor(atk.SHP*3*STR/2), force: atk.energy+ Math.floor(atk.forceMod*3*STR/2)}
  const braced = {name: 'braced', AP: atk.AP+2, STA:1, penalty: 0, blunt: atk.energy+ Math.floor(STR), cut: atk.energy+ Math.floor(atk.SHP*STR), force: atk.energy+ Math.floor(atk.forceMod*STR) }
  const hook = {name: 'hook', AP: atk.AP, STA:0, penalty: 0, blunt: atk.energy, cut: atk.energy*atk.SHP, force: atk.energy*atk.forceMod  }
  const quickShot = {name: 'quick', AP: atk.AP, STA:0, penalty: 3, blunt: atk.energy, cut: atk.energy*atk.SHP, force: atk.energy*atk.forceMod  }
  const snipe = {name: 'snipe', AP: atk.AP+2, STA:0, penalty: 0, blunt: atk.energy, cut: atk.energy*atk.SHP, force: atk.energy*atk.forceMod  }

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
  return(
    <>
      {
        attacks.map(el =>
          <input className="bg-gray-500 border rounded px-1" type='button' key={el.name} value={el.name} onClick={() => pressAtk(el, atk.type, weaponName)} />
        )
      }
    </>
  )
}

  return(
    <div className='flex flex-col justify-center w-84 md:w-full'>
      <span className="pb-1"> Weapon: {lastAtk.weapon} /  type: {lastAtk.type} / ROLL: {lastAtk.atk}  </span>
      {
        Object.entries(weapons).map(([key, el]) => {
          
          return(
            <div key={key} className='flex flex-col justify-center border rounded p-1'>
              <div className='flex flex-row gap-3' >
                <span>Weapon: {key} </span>
                {
                  <>
                    <span>Size: {el.scale}</span>
                    <input type='button' value='unequip' onClick={() => unequip(el.name)} className='border rounded p-1' />                    
                  </>
                }
              </div>
              <table className='md:w-full text-center text-xs'>
                <thead>
                  <tr>
                    <td>RES</td>
                    <td>force</td>
                    <td>blunt</td>
                    <td>cutting</td>
                    <td>AP</td>
                    <td>reach</td>
                    <td>DEF</td>
                    <td>properties</td>
                    <td>attacks</td>
                    {/* <td>moded atk</td> */}
                  </tr>
                </thead>
                <tbody>
                  {
                    el.attacks.map((atk, index) => 
                      <tr key={el+index.toString()}>
                        <td>{parseModdedValue(atk.RES, atk.RESmod)}</td>
                        <td>{parseAtkDamage(atk, el.scale, "force")}</td>
                        <td>{parseAtkDamage(atk, el.scale, "blunt")}</td>
                        <td>{parseAtkDamage(atk, el.scale, "cutting")}</td>
                        <td>{atk.AP + (atk.reload ? '+' + atk.reload : '')/*+ '+' + (atk.heavyMod === 0.5 ? 1 : atk.heavyMod === 1 ? 2 : atk.heavyMod === 1.5 ? 3 : 0)*/}</td>
                        <td>{atk.range}</td>
                        <td>{atk.deflection}</td>
                        <td>{atk.properties}</td>
                        <td><AttackButtons atk={atk} weaponName={el.name} /></td>
                        {/* <td>{atk.heavyMod > 0 ? <input className="bg-gray-500 border rounded px-1" type='button' value={'heavy'} onClick={() => pressAtk(atk, 'heavy', el.name)}  /> : null}</td> */}
                      </tr>
                    )
                  }
                </tbody>
              </table>
            </div>
          )
        })
      }
    </div>
  )
}


