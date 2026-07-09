import { describe, it, expect } from 'vitest'
import { getItemWeapon, getItemArmor } from './items'
import { ItemSchema } from '../../types'

describe('getItemWeapon', () => {
  it('resolves a weapon-typed item to the real catalog entry', () => {
    const item = ItemSchema.parse({ name: 'Dagger', type: 'weapon', refId: 'Dagger' })
    const weapon = getItemWeapon(item)
    expect(weapon?.name).toBe('Dagger')
    expect(weapon?.attacks.length).toBeGreaterThan(0)
  })

  it('returns undefined when type is not weapon', () => {
    const item = ItemSchema.parse({ name: 'Dagger', type: 'misc', refId: 'Dagger' })
    expect(getItemWeapon(item)).toBeUndefined()
  })

  it('returns undefined with no refId', () => {
    const item = ItemSchema.parse({ name: 'Rope', type: 'weapon' })
    expect(getItemWeapon(item)).toBeUndefined()
  })

  it('returns undefined for an unknown refId', () => {
    const item = ItemSchema.parse({ type: 'weapon', refId: 'NoSuchWeapon' })
    expect(getItemWeapon(item)).toBeUndefined()
  })
})

describe('getItemArmor', () => {
  it('resolves an armor-typed item to the real catalog entry', () => {
    const item = ItemSchema.parse({ name: 'Clothing', type: 'armor', refId: 'Clothing' })
    const armor = getItemArmor(item)
    expect(armor?.name).toBe('Clothing')
  })

  it('returns undefined when type is not armor', () => {
    const item = ItemSchema.parse({ name: 'Clothing', type: 'misc', refId: 'Clothing' })
    expect(getItemArmor(item)).toBeUndefined()
  })
})

describe('flavor items with no refId', () => {
  it('are told apart only by their own name/description', () => {
    const item = ItemSchema.parse({ name: 'Rusty Key', description: 'opens something, somewhere' })
    expect(item.name).toBe('Rusty Key')
    expect(item.description).toBe('opens something, somewhere')
    expect(getItemWeapon(item)).toBeUndefined()
    expect(getItemArmor(item)).toBeUndefined()
  })
})
