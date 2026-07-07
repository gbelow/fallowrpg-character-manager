'use client'

import { useState } from "react";
import { useCharacteristicLens } from "../hooks/useCharacteristicLens";
import { useWeaponLens } from "../hooks/useWeaponLens";
import { WeaponAttack } from "../domain/types";
import { parseAtkDamage } from "../domain/character/commands";


export function WeaponPanel(){
  const {weapons, unequip, getVariantsList, attack} = useWeaponLens()

  const [lastAtk, setLastAtk] = useState({atk:0, type: '', weapon: '', blunt: 0, cut: 0})
  const [STR] = useCharacteristicLens('STR') ?? 10


  const parseModdedValue = (value: number, mod: number) => {
    if(mod === 0) return value
      return Math.floor(value + mod*STR)
  }

  const AttackButtons = ({atk, weaponName} : {atk: WeaponAttack, weaponName: string }) =>{
    const attacks = getVariantsList(atk) ?? []
    return(
      <>
        {
          attacks.map(el => {
            const handleClick = () => {
              const result = attack(el, el.type, weaponName)
              if (result) {
                setLastAtk(result)
              }
            }
            return <input className="bg-gray-500 border rounded px-1" type='button' key={el.name} value={el.name} onClick={handleClick} />
          })
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
                    <td>blunt</td>
                    <td>cutting</td>
                    <td>AP</td>
                    <td>reach</td>
                    <td>DEF</td>
                    <td>properties</td>
                    <td>attacks</td>
                  </tr>
                </thead>
                <tbody>
                  {
                    el.attacks.map((atk, index) => 
                      <tr key={el+index.toString()}>
                        <td>{parseModdedValue(atk.RES, atk.RESmod)}</td>
                        <td>{parseAtkDamage(atk, el.scale, "blunt")}</td>
                        <td>{parseAtkDamage(atk, el.scale, "cutting")}</td>
                        <td>{atk.AP + (atk.reload ? '+' + atk.reload : '')/*+ '+' + (atk.heavyMod === 0.5 ? 1 : atk.heavyMod === 1 ? 2 : atk.heavyMod === 1.5 ? 3 : 0)*/}</td>
                        <td>{atk.range}</td>
                        <td>{atk.deflection}</td>
                        <td>{atk.properties}</td>
                        <td><AttackButtons atk={atk} weaponName={el.name} /></td>
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


