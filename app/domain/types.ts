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

export const TrainableTypeSchema = z.enum(['skill', 'attribute', 'talent', 'proficiency'])
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
const trainable = (type: TrainableType, value = 0) =>
  TrainableSchema.default({ value, name: '', XP: 0, talent: '', type })

// ── groups (each is a subset type on its own) ───────────
export const SkillsSchema = z.object({
  strike: trainable('skill'),
  defend: trainable('skill'),
  reflex: trainable('skill'),
  accuracy: trainable('skill'),
  grapple: trainable('skill'),
  SD: trainable('skill'),
  stealth: trainable('skill'),
  prestidigitation: trainable('skill'),
  balance: trainable('skill'),
  detection: trainable('skill'),
  health: trainable('skill'),
  swim: trainable('skill'),
  climb: trainable('skill'),
  explore: trainable('skill'),
  cunning: trainable('skill'),
  will: trainable('skill'),
  persuasion: trainable('skill'),
  deception: trainable('skill'),
  insight: trainable('skill'),
}).strip()
export type Skills = z.infer<typeof SkillsSchema>

export const AttributesSchema = z.object({
  STR: trainable('attribute', 10),
  AGI: trainable('attribute', 10),
  STA: trainable('attribute', 10),
}).strip()
export type Attributes = z.infer<typeof AttributesSchema>

export const TalentsSchema = z.object({
  CON: trainable('talent'),
  INT: trainable('talent'),
  SPI: trainable('talent'),
  DEX: trainable('talent'),
}).strip()
export type Talents = z.infer<typeof TalentsSchema>

export const ProficienciesSchema = z.object({
  melee: trainable('proficiency'),
  ranged: trainable('proficiency'),
  awareness: trainable('proficiency'),
  sorcery: trainable('proficiency'),
  conviction1: trainable('proficiency'),
  conviction2: trainable('proficiency'),
  devotion: trainable('proficiency'),
  charisma: trainable('proficiency'),
}).strip()

export type Proficiencies = z.infer<typeof ProficienciesSchema>

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
  size: num.default(0),
  name: str.default(''),
  description: str.default(''),
}).strip()

export type Item = z.infer<typeof ItemSchema>

export const ContainerSchema = z.object({
  name: str.default(''),
  capacity: num.default(0),
  penalty: num.default(0),
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
  // characteristics: CharacteristicsSchema.partial().default({}).transform(v => CharacteristicsSchema.parse(v)),
  size: z.number().default(3),
  TGH: z.number().default(0),
  // skills: SkillsSchema.partial().default({}).transform(v => SkillsSchema.parse(v)),
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

// T must at least satisfy the Character shape
export interface Lens<T extends Character, V> {
  get: (subject: T) => V;
  set: (subject: T, value: V) => T;
}