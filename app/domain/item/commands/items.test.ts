import { describe, it, expect } from 'vitest'
import { duplicateItem, addItemToContainer, removeItemFromContainer } from './items'
import { makeCharacter } from '../../factories'
import { ContainerSchema, ItemSchema } from '../../types'

function characterWithBelt() {
  return makeCharacter({
    containers: {
      belt: ContainerSchema.parse({ name: 'Belt', numSlots: 4, slotBulk: 0 }),
    },
  })
}

function coin(amount = 1) {
  return ItemSchema.parse({ name: 'Coin', bulk: 0, amount })
}

describe('duplicateItem', () => {
  it('gives the copy a new id but keeps the rest', () => {
    const original = coin(5)
    const copy = duplicateItem(original)
    expect(copy.id).not.toBe(original.id)
    expect(copy.name).toBe('Coin')
    expect(copy.amount).toBe(5)
  })

  it('applies overrides (e.g. splitting a stack)', () => {
    const stack = coin(5)
    const split = duplicateItem(stack, { amount: 2 })
    expect(split.amount).toBe(2)
    expect(split.id).not.toBe(stack.id)
  })
})

describe('addItemToContainer', () => {
  it('adds an item that fits', () => {
    const c = characterWithBelt()
    const item = coin(1)
    const after = addItemToContainer('belt', item)(c)
    expect(after.containers.belt.items).toHaveLength(1)
    expect(after.containers.belt.items[0].id).toBe(item.id)
  })

  it('throws when the container does not exist', () => {
    const c = characterWithBelt()
    expect(() => addItemToContainer('missing', coin())(c)).toThrow()
  })

  it('throws when the item does not fit', () => {
    const c = characterWithBelt()
    const tooBig = ItemSchema.parse({ name: 'Crate', bulk: 2 })
    expect(() => addItemToContainer('belt', tooBig)(c)).toThrow()
  })

  it('does not mutate the input character', () => {
    const c = characterWithBelt()
    const before = c.containers.belt.items.length
    addItemToContainer('belt', coin())(c)
    expect(c.containers.belt.items.length).toBe(before)
  })
})

describe('removeItemFromContainer', () => {
  it('removes an item by id', () => {
    const c = characterWithBelt()
    const item = coin(1)
    const withItem = addItemToContainer('belt', item)(c)
    const after = removeItemFromContainer('belt', item.id)(withItem)
    expect(after.containers.belt.items).toHaveLength(0)
  })

  it('is a no-op when the container does not exist', () => {
    const c = characterWithBelt()
    expect(removeItemFromContainer('missing', 'x')(c)).toBe(c)
  })
})
