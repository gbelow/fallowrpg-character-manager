import { Armor, ArmorSchema, Item, Weapon, WeaponSchema } from '../../types'
import weaponsCatalog from '../../../assets/weapons.json'
import armorsCatalog from '../../../assets/armors.json'

// resolves what a refId'd item actually is, so e.g. a weapon sitting in a
// backpack can be equipped as the real thing rather than staying a wrapper
export function getItemWeapon(item: Item): Weapon | undefined {
  if (item.type !== 'weapon' || !item.refId) return undefined
  const raw = (weaponsCatalog as Record<string, unknown>)[item.refId]
  return raw ? WeaponSchema.parse(raw) : undefined
}

export function getItemArmor(item: Item): Armor | undefined {
  if (item.type !== 'armor' || !item.refId) return undefined
  const raw = (armorsCatalog as Record<string, unknown>)[item.refId]
  return raw ? ArmorSchema.parse(raw) : undefined
}
