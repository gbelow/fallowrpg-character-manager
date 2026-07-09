import { z } from 'zod'
import { AFFLICTIONS } from './tables'

const num = z.number()
const str = z.string()

export const ArmorSchema = z.object({
  name: z.string().default('Skin'),
  RES: z.number().default(0),
  RESlayer: z.number().default(0),
  // TGH: z.number().default(0),
  INS: z.number().default(0),
  // poise: z.number().default(0),
  protection: z.number().default(0),
  deflection: z.number().default(0),
  penalty: z.number().default(0),
  properties: str.default(''),
  notes: z.string().default(''),
}).strip()

export type Armor = z.infer<typeof ArmorSchema>

export const TrainableTypeSchema = z.enum(['skill', 'attribute', 'talent', 'proficiency', 'knowledge'])
export type TrainableType = z.infer<typeof TrainableTypeSchema>

export const TrainableSchema = z.object({
  value: z.number().default(0),
  name: z.string().default(''),
  XP: z.number().default(0),
  talent: z.string().default(''),
  type: TrainableTypeSchema.default('skill'),
}).strip()
export type Trainable = z.infer<typeof TrainableSchema>

// small helper so the group schemas aren't a wall of repeated defaults
const trainable = (type: TrainableType, value = 0, name: string) =>
  TrainableSchema.default({ value, name, XP: 0, talent: '', type })

// ── groups (each is a subset type on its own) ───────────
export const SkillsSchema = z.object({
  strike: trainable('skill', 0, 'Strike'),
  defend: trainable('skill', 0, 'Defend'),
  reflex: trainable('skill', 0, 'Reflex'),
  accuracy: trainable('skill', 0, 'Accuracy'),
  grapple: trainable('skill', 0, 'Grapple'),
  SD: trainable('skill', 0, 'SD'),
  stealth: trainable('skill', 0, 'Stealth'),
  prestidigitation: trainable('skill', 0, 'Prestidigitation'),
  balance: trainable('skill', 0, 'Balance'),
  detection: trainable('skill', 0, 'Detection'),
  health: trainable('skill', 0, 'Health'),
  swim: trainable('skill', 0, 'Swim'),
  climb: trainable('skill', 0, 'Climb'),
  explore: trainable('skill', 0, 'Explore'),
  cunning: trainable('skill', 0, 'Cunning'),
  will: trainable('skill', 0, 'Will'),
  persuasion: trainable('skill', 0, 'Persuasion'),
  deception: trainable('skill', 0, 'Deception'),
  insight: trainable('skill', 0, 'Insight'),
}).strip()
export type Skills = z.infer<typeof SkillsSchema>

export const AttributesSchema = z.object({
  STR: trainable('attribute', 10, 'Strength'),
  AGI: trainable('attribute', 10, 'Agility'),
  STA: trainable('attribute', 10, 'Stamina'),
}).strip()
export type Attributes = z.infer<typeof AttributesSchema>

export const TalentsSchema = z.object({
  CON: trainable('talent', 0, 'Constitution'),
  INT: trainable('talent', 0, 'Intelligence'),
  SPI: trainable('talent', 0, 'Spirit'),
  DEX: trainable('talent', 0, 'Dexterity'),
}).strip()
export type Talents = z.infer<typeof TalentsSchema>

export const ProficienciesSchema = z.object({
  melee: trainable('proficiency', 0, 'Melee'),
  ranged: trainable('proficiency', 0, 'Ranged'),
  awareness: trainable('proficiency', 0, 'Awareness'),
  sorcery: trainable('proficiency', 0, 'Sorcery'),
  conviction1: trainable('proficiency', 0, 'Conviction 1'),
  conviction2: trainable('proficiency', 0, 'Conviction 2'),
  devotion: trainable('proficiency', 0, 'Devotion'),
  charisma: trainable('proficiency', 0, 'Charisma'),
}).strip()

export type Proficiencies = z.infer<typeof ProficienciesSchema>

// Knowledges are open-ended (players can invent arbitrary ones, e.g. a
// specific town or how to ride a specific animal), so the key set can't be a
// closed schema like the other trainable groups — it's a plain string-keyed
// map, kept off the closed TrainablesSchema union. Missing keys default to 0
// via getKnowledgeValue, same as an untrained fixed skill would.
export const KnowledgesSchema = z.record(z.string(), TrainableSchema).default({})
export type Knowledges = z.infer<typeof KnowledgesSchema>

// ── merged whole ────────────────────────────────────────
export const TrainablesSchema = SkillsSchema
  .merge(AttributesSchema)
  .merge(TalentsSchema)
  .merge(ProficienciesSchema)

export type Trainables = z.infer<typeof TrainablesSchema>

export const CharacteristicsSchema = AttributesSchema
  .merge(TalentsSchema)
  .merge(ProficienciesSchema)

export type Characteristics = z.infer<typeof CharacteristicsSchema>

export const MovementSchema = z.object({
  basic: num.default(1),
  careful: num.default(0.5),
  crawl: num.default(0.33),
  run: num.default(0),
  jump: num.default(0),
  swim: num.default(0.33),
  'fast swim': num.default(0.5),
  stand: num.default(0),
}).strip()

export type Movement = z.infer<typeof MovementSchema>

export const WeaponAttackSchema = z.object({
  type: str.default('melee'),
  handed: str.default('small'),

  energy: num.default(0),
  STRmod: num.default(0),
  heavyMod: num.default(0),
  SHP: num.default(0),
  // forceMod: num.default(0),

  range: str.default('short'),

  RES: num.default(0),
  RESmod: num.default(0),

  AP: num.default(0),
  reload: num.default(0),
  deflection: num.default(0),

  properties: str.default(''),
}).strip()

export type WeaponAttack = z.infer<typeof WeaponAttackSchema>

export const WeaponSchema = z.object({
  name: str.default(''),
  penalty: num.default(0),
  scale: num.default(3),
  attacks: z.array(WeaponAttackSchema).default([]),
}).strip()

export type Weapon = z.infer<typeof WeaponSchema>

export const ItemSchema = z.object({
  id: str.default(() => crypto.randomUUID()),
  name: str.default(''), // with no refId, this + description is all that says what the item is
  description: str.default(''),
  type: str.default('misc'), // which catalog refId resolves in, e.g. 'weapon' -> weapons.json, 'armor' -> armors.json
  amount: num.default(1),
  bulk: num.default(0), // 0 small · 1 medium · 2 large · 3+ cargo
  refId: str.default(''), // key into the type's catalog; empty means this item is pure flavor, no linked object
}).strip()

export type Item = z.infer<typeof ItemSchema>

export const ContainerKindSchema = z.enum(['belt', 'backpack', 'transport'])
export type ContainerKind = z.infer<typeof ContainerKindSchema>

export const ContainerSchema = z.object({
  name: str.default(''),
  kind: ContainerKindSchema.default('backpack'),
  numSlots: num.default(0),
  slotBulk: num.default(0), // bulk ladder position one slot accepts
  penalty: num.default(0),
  liftThreshold: z.object({ // narrow per-container exception (e.g. Large Backpack's "STR 15 or size 4" footnote) — most containers omit this
    STR: num.optional(),
    size: num.optional(),
  }).optional(),
  items: z.array(ItemSchema).default([]),
}).strip()

export type Container = z.infer<typeof ContainerSchema>

export const InjuriesSchema = z.object({
  injuryLevel: z.number().default(0),
  wounds: z.array(num).default([]),
  hemorrhage: z.number().default(0),
  potion: z.number().default(0),
  injuryThreshold: z.number().default(10),
  unconsciousThreshold: z.number().default(40),
  deathThreshold: z.number().default(50),
}).strip()

export type Injuries = z.infer<typeof InjuriesSchema>

export const WoundSchema = z.object({
  severity: z.number().default(0),
  location: z.string().default(''),
  description: z.string().default(''),
}).strip()

export type Wound = z.infer<typeof WoundSchema>

export const ResourcesSchema = z.object({
  AP: num.default(0),
  STA: num.default(0),
  hunger: num.default(0),
  thirst: num.default(0),
  exhaustion: num.default(0),
}).strip()

export type Resources = z.infer<typeof ResourcesSchema>

export const AfflictionItemSchema = z.object({
  mobility: num.optional(),
  sensory: num.optional(),
  mental: num.optional(),
  health: num.optional(),
  injury: num.optional(),
  controlable: z.boolean().default(false),
}).strip()

export type AfflictionItem = z.infer<typeof AfflictionItemSchema>

export const CharacterAfflictionsSchema =
  z.array(z.string()).default([])

export type CharacterAfflictions =
  z.infer<typeof CharacterAfflictionsSchema>

export type AfflictionKey = keyof typeof AFFLICTIONS

const AfflictionKeySchema =
  z.enum(Object.keys(AFFLICTIONS) as [AfflictionKey, ...AfflictionKey[]])

export const SenseSchema = z.object({
  name: z.string().default(''),
  rangePenalty: z.number().default(5),
  bonus: z.number().default(0),
  active: z.boolean().default(true),
  hasSense: z.boolean().default(true),
}).strip()

export type Sense = z.infer<typeof SenseSchema>

export const SensesSchema = z.object({
  vision: SenseSchema.default({ name: 'Vision', active: true, rangePenalty: 2, bonus: 0, hasSense: true }),
  hearing: SenseSchema.default({ name: 'Hearing', active: false, rangePenalty: 5, bonus: 0, hasSense: true }),
  smell: SenseSchema.default({ name: 'Smell', active: false, rangePenalty: 5, bonus: 0, hasSense: true }),
  touch: SenseSchema.default({ name: 'Touch', active: true, rangePenalty: 100, bonus: 0, hasSense: true }),
  synesthesia: SenseSchema.default({ name: 'Synesthesia', active: true, rangePenalty: 100, bonus: 0, hasSense: false }),
}).strip()

export type Senses = z.infer<typeof SensesSchema>

const CampaignValues = {
  injuries: InjuriesSchema.partial().default({}).transform(v => InjuriesSchema.parse(v)),
  afflictions: z.array(AfflictionKeySchema).default([]),
  resources: ResourcesSchema.partial().default({}).transform(v => ResourcesSchema.parse(v)),
  hasActionSurge: z.boolean().default(false),
}

export const CampaignValuesSchema = z.object({
  ...CampaignValues
})

export type CampaignValues = z.infer<typeof CampaignValuesSchema>

const CharacterValues = {
  id: z.string().default(() => crypto.randomUUID()),
  name: z.string().default(''),

  trainables: TrainablesSchema.partial().default({}).transform(v => TrainablesSchema.parse(v)),
  knowledges: KnowledgesSchema,
  size: z.number().default(3),
  TGH: z.number().default(0),
  senses: SensesSchema.partial().default({}).transform(v => SensesSchema.parse(v)),
  movement: MovementSchema.partial().default({}).transform(v => MovementSchema.parse(v)),
  
  hasGauntlets: z.number().default(0),
  hasHelm: z.number().default(0),
  
  armor: ArmorSchema.partial().default({}).transform(v => ArmorSchema.parse(v)),
  weapons: z.record(z.string(), WeaponSchema).default({}),
  containers: z.record(z.string(), ContainerSchema).default({}),

  notes: z.string().default(''),
}


export const BaseCharacterSchema = z.object({
  
  path: z.string(),
  type: z.literal('base').default('base'),
  ...CharacterValues
}).strip()

export type BaseCharacter = z.infer<typeof BaseCharacterSchema>

export const CampaignCharacterSchema = z.object({
  ...CharacterValues,
  type: z.literal('campaign').default('campaign'),
  ...CampaignValues,
  fightName: z.string().optional(),
})

export type CampaignCharacter = z.infer<typeof CampaignCharacterSchema>

export type Character = BaseCharacter | CampaignCharacter

export type CharacterUpdater = (c: Character) => Character
export type CampaignCharacterUpdater = (c: Character) => CampaignCharacter

export interface Lens<T, V> {
  get: (subject: T) => V;
  set: (subject: T, value: V) => T;
}