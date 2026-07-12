import { BaseCharacter } from '../types'

// Categorization is a *derived* view, not stored structure: the sidebar tree is
// built fresh from each character's `tags`. The first tag is the top-level
// group, the second the sub-group, and so on — arbitrarily deep. A character
// with no tags lands in the UNTAGGED bucket. This is the read-side analogue of
// the lens pattern: pure, deterministic, no React.

export const UNTAGGED = 'untagged'

export type CharacterNode = { type: 'character'; character: BaseCharacter }
export type GroupNode = { type: 'group'; label: string; tags: string[]; children: TreeNode[] }
export type TreeNode = GroupNode | CharacterNode

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })
const byLabel = (a: { label: string }, b: { label: string }) => collator.compare(a.label, b.label)
const byName = (a: BaseCharacter, b: BaseCharacter) => collator.compare(a.name, b.name)

/**
 * Build a grouped tree from a flat list of base characters. Characters with the
 * same tag path are collected under the same group node; ordering is stable
 * (labels and names sorted with a numeric-aware collator). Returns the root's
 * children — the top-level groups and any untagged characters.
 */
export function groupByTags(characters: BaseCharacter[]): TreeNode[] {
  const root = createBucket()

  for (const character of characters) {
    const tags = character.tags?.length ? character.tags : [UNTAGGED]
    insert(root, tags, character)
  }

  return finalize(root, [])
}

type Bucket = { groups: Map<string, Bucket>; characters: BaseCharacter[] }

function createBucket(): Bucket {
  return { groups: new Map(), characters: [] }
}

function insert(bucket: Bucket, tags: string[], character: BaseCharacter): void {
  const [head, ...rest] = tags
  if (!head) {
    bucket.characters.push(character)
    return
  }
  let child = bucket.groups.get(head)
  if (!child) {
    child = createBucket()
    bucket.groups.set(head, child)
  }
  insert(child, rest, character)
}

function finalize(bucket: Bucket, path: string[]): TreeNode[] {
  const nodes: TreeNode[] = []

  for (const [label, child] of bucket.groups) {
    const tags = [...path, label]
    nodes.push({
      type: 'group',
      label,
      tags,
      children: finalize(child, tags),
    })
  }

  for (const character of [...bucket.characters].sort(byName)) {
    nodes.push({ type: 'character', character })
  }

  // Groups first (sorted), then characters; groups never interleave with leaves.
  return nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'group' ? -1 : 1
    if (a.type === 'group' && b.type === 'group') return byLabel(a, b)
    // both are character nodes here
    return byName((a as CharacterNode).character, (b as CharacterNode).character)
  })
}
