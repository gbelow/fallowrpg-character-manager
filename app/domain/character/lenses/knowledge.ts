import { Character, Knowledges, Lens, Trainable, TrainableSchema } from '../../types'
import { composeLens, makePropLens } from './factories'

export function emptyKnowledge(name: string): Trainable {
  return TrainableSchema.parse({ name, type: 'knowledge' })
}

export const knowledgesLens: Lens<Character, Knowledges> = makePropLens<Character, 'knowledges'>('knowledges')

// Unlike makePropLens<Trainables, keyof Trainables>, this hop can't assume the
// key exists — `knowledges` starts at {} and only gains entries as they're
// set — so it defaults to an empty Trainable instead of reading `undefined`.
function knowledgeEntryLens(name: string): Lens<Knowledges, Trainable> {
  return {
    get: (knowledges) => knowledges[name] ?? emptyKnowledge(name),
    set: (knowledges, value) => ({ ...knowledges, [name]: value }),
  }
}

export function makeKnowledgeEntryLens(name: string): Lens<Character, Trainable> {
  return composeLens(knowledgesLens, knowledgeEntryLens(name))
}

export function makeKnowledgeLens(name: string): Lens<Character, number> {
  return composeLens(makeKnowledgeEntryLens(name), makePropLens<Trainable, 'value'>('value'))
}
