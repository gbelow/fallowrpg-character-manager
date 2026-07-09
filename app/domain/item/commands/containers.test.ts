import { describe, it, expect } from 'vitest'
import { equipContainer, unequipContainer } from './containers'
import { makeCharacter } from '../../factories'
import { ContainerSchema } from '../../types'

describe('equipContainer', () => {
  it('equips a container under the given key', () => {
    const c = makeCharacter({})
    const belt = ContainerSchema.parse({ name: 'Belt', kind: 'belt' })
    const after = equipContainer('belt', belt)(c)
    expect(after.containers.belt.name).toBe('Belt')
  })

  it('replaces any other entry already of the same kind (backpack)', () => {
    const c = makeCharacter({
      containers: {
        oldPack: ContainerSchema.parse({ name: 'Backpack', kind: 'backpack' }),
      },
    })
    const largeBackpack = ContainerSchema.parse({ name: 'Large Backpack', kind: 'backpack' })
    const after = equipContainer('newPack', largeBackpack)(c)
    expect(after.containers.oldPack).toBeUndefined()
    expect(after.containers.newPack.name).toBe('Large Backpack')
  })

  it('leaves unrelated containers (e.g. a belt) alone when swapping a backpack', () => {
    const c = makeCharacter({
      containers: {
        belt: ContainerSchema.parse({ name: 'Belt', kind: 'belt' }),
        oldPack: ContainerSchema.parse({ name: 'Backpack', kind: 'backpack' }),
      },
    })
    const after = equipContainer('newPack', ContainerSchema.parse({ name: 'Large Backpack', kind: 'backpack' }))(c)
    expect(after.containers.belt).toBeDefined()
  })

  it('does not enforce a singleton for transports', () => {
    const c = makeCharacter({
      containers: {
        sled: ContainerSchema.parse({ name: 'Sled', kind: 'transport' }),
      },
    })
    const after = equipContainer('cart', ContainerSchema.parse({ name: 'One-Horse Cart', kind: 'transport' }))(c)
    expect(after.containers.sled).toBeDefined()
    expect(after.containers.cart).toBeDefined()
  })
})

describe('unequipContainer', () => {
  it('removes the container at the given key', () => {
    const c = makeCharacter({
      containers: { belt: ContainerSchema.parse({ name: 'Belt' }) },
    })
    const after = unequipContainer('belt')(c)
    expect(after.containers.belt).toBeUndefined()
  })

  it('is a no-op when the key does not exist', () => {
    const c = makeCharacter({})
    expect(unequipContainer('missing')(c)).toBe(c)
  })
})
