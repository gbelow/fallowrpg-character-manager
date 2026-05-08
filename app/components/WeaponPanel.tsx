'use client'

import { useState } from "react";
import { makeFullRoll } from "./utils";
import { dmgArr } from "../domain/tables";
import { useSkillLens } from "../hooks/useSkillLens";
import { useCharacteristicLens } from "../hooks/useCharacteristicLens";
import { useWeaponLens } from "../hooks/useWeaponLens";
import { useResourceLens } from "../hooks/useResourceLens";
import { WeaponAttack } from "../domain/types";
import { useCharacterCommands } from "../hooks/useCharacterCommands";

export function WeaponPanel(){
  const {weapons, unequip} = useWeaponLens()
  const [STA] = useResourceLens('STA')
  const { updateSTA } = useCharacterCommands()
  const [AP, setAP] = useResourceLens('AP')  

  const [lastAtk, setLastAtk] = useState({atk:0, properties: '', weapon: ''})
  const [strike] = useSkillLens('strike')
  const [accuracy] = useSkillLens('accuracy')
  const [STR] = useCharacteristicLens('STR') ?? 10

  const pressAtk = (atk: WeaponAttack, modification: string, weapon: string,) => {
    if(AP < atk.AP) return
    if(atk.heavyMod > 0 && STA < 1) return
    setAP(AP - atk.AP - (modification !== 'heavy' ? 0 : atk.heavyMod === 0.5 ? 1 : atk.heavyMod === 1 ? 2 : atk.heavyMod === 1.5 ? 3 : 0 ))
    if(modification !== 'basic') updateSTA(STA - 1)

    const roll = makeFullRoll()
    let val = roll
    if(atk.heavyMod == 1) val -= 2 
    if(atk.heavyMod >= 1.5) val -= 3 
    if(atk.type=='ranged') val += accuracy
    if(atk.type=='melee') val += strike
    setLastAtk({atk: val, properties: modification, weapon})
  }

  return(
    <div className='flex flex-col justify-center w-84 md:w-full'>
      <span className="pb-1"> Weapon: {lastAtk.weapon} /  properties: {lastAtk.properties} / ROLL: {lastAtk.atk}  </span>
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
                    <td>TGH</td>
                    <td>impact/PEN</td>
                    <td>AP</td>
                    <td>reach</td>
                    <td>DEF</td>
                    <td>properties</td>
                    <td>basic atk</td>
                    <td>moded atk</td>
                  </tr>
                </thead>
                <tbody>
                  {
                    el.attacks.map((atk, index) => 
                      <tr key={el+index.toString()}>
                        <td>{atk.RES}</td>
                        <td>{atk.TGH}</td>
                        <td>{parseAtkDamage(atk, el.scale, STR)}</td>
                        <td>{atk.AP + '+' + (atk.heavyMod === 0.5 ? 1 : atk.heavyMod === 1 ? 2 : atk.heavyMod === 1.5 ? 3 : 0)}</td>
                        <td>{atk.range}</td>
                        <td>{atk.deflection}</td>
                        <td>{atk.props}</td>
                        <td><input className="bg-gray-500 border rounded px-1" type='button' value={'basic'} onClick={() => pressAtk(atk, 'basic', el.name)} /></td>
                        <td>{atk.heavyMod > 0 ? <input className="bg-gray-500 border rounded px-1" type='button' value={'heavy'} onClick={() => pressAtk(atk, 'heavy', el.name)}  /> : null}</td>
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

function parseAtkDamage(atk: WeaponAttack, scale: number, STR: number) {
  return(
    atk.impact+(atk.heavyMod ? '+' + (atk.type == 'melee' ? Math.floor(atk.heavyMod*STR*dmgArr[scale-1])  : atk.heavyMod*dmgArr[scale-1]) : '' ) + '/' +Math.floor(atk.impact*atk.penMod)+(atk.heavyMod ? '+'+(atk.type == 'melee' ? Math.floor(atk.heavyMod*atk.penMod*STR*dmgArr[scale-1]) : atk.heavyMod*atk.penMod*dmgArr[scale-1]) : '')

  )
}
