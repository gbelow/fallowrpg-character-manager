'use client'
import { putGauntlets, putHelm } from '../domain/commands/equipArmor'
import { makeCharacter } from '../domain/factories'
import { ArmorSchema } from '../domain/types'
import { useActiveCharacter } from '../hooks/useActiveCharacter'
import { useArmorLens } from '../hooks/useArmorLens'
import { useCharacteristicLens } from '../hooks/useCharacteristicLens'

export function ArmorPanel(){
  const [armor] = useArmorLens()

  const fallback = makeCharacter('')
  const effectiveRES = useCharacteristicLens('RES')[0] ?? fallback.characteristics.RES
  // const effectiveTGH = useCharacteristicLens('TGH')[0] ?? fallback.characteristics.TGH
  const effectiveINS = useCharacteristicLens('INS')[0] ?? fallback.characteristics.INS

  return(
    <>
      <div className='font-bold '>Armor: {armor.name}</div>
      <ArmorAddons />
      <table className='w-84 md:w-full text-center'>
        <thead>
          <tr >
            <th></th>
            <th>PROT (blunt)</th>
            <th>RES (piercing)</th>
            <th>INS (burn)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>T0</td>
            <td>{ armor.prot}</td>
            <td>{ armor.RES}</td>
            <td>{ armor.INS}</td>
          </tr>
          <tr>
            <td>T1</td>
            <td>{effectiveRES + armor.prot}</td>
            <td>{effectiveRES + armor.RES}</td>
            <td>{effectiveINS + armor.INS}</td>
          </tr>
          <tr>
            <td>T2</td>
            <td>{effectiveRES*2 + armor.prot}</td>
            <td>{effectiveRES*2 + armor.RES}</td>
            <td>{effectiveINS*2 + armor.INS}</td>
          </tr>
          <tr>
            <td>T3</td>
            <td>{effectiveRES*3 + armor.prot}</td>
            <td>{effectiveRES*3 + armor.RES}</td>
            <td>{effectiveINS*3 + armor.INS}</td>
          </tr>
          <tr>
            <td>T4</td>
            <td>{effectiveRES*4 + armor.prot}</td>
            <td>{effectiveRES*4 + armor.RES}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <div className='flex gap-2 text-center justify-center'>
        <span>TGH {armor.TGH}</span>
        <span>Penal {armor.penalty}</span>
        <span>Coverage {armor.cover}</span>
      </div>
    </>
  )
}

function ArmorAddons (){
  const {character, update} = useActiveCharacter()

  return(
    <div className='flex flex-row gap-2'>
        <div className='flex flex-col'>
          <label>Gauntlet</label>
          <input type='checkbox' aria-label={'gaunt'} name={'gaunt'} checked={!!character?.hasGauntlets} onChange={() => update(putGauntlets)} />
        </div>
        <div className='flex flex-col'>
          <label>Full Helm</label>
          <input type='checkbox' aria-label={'helm'} name={'helm'} checked={!!character?.hasHelm} onChange={() => update(putHelm)} />
        </div>
      </div>
  )
}
