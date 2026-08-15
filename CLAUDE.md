# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**chargenfallow** (a.k.a. UDGS-runtime) is a Next.js character generator / game-running tool for the tabletop RPG "fallowRPG". Its explicit purpose is to explore **deterministic frontend architecture**: a pure domain layer fully owns all game rules and derived values, while React acts only as an integration/rendering layer. When making changes, preserve this inversion — authoritative logic must never leak into components or hooks.

## Commands

```bash
pnpm dev      # dev server with Turbopack (localhost:3000)
pnpm build    # production build with Turbopack
pnpm start    # serve production build
pnpm lint     # eslint
pnpm test     # vitest (watch)
pnpm test:run # vitest single run
```

- Package manager is **pnpm** (`pnpm-lock.yaml`; the old `yarn.lock` is deleted). Node v20+.
- Tests run on **Vitest** (`pnpm test` / `pnpm test:run`). Test files (`*.test.ts`) live alongside the domain code they exercise — lenses, commands, factories, and items.
- Requires `.env` with `UPSTASH_REDIS_URL` and `UPSTASH_REDIS_TOKEN` (see `.env.example`) for Redis persistence.

## Architecture

Data flows in one direction: **Domain (pure) → Zustand stores (non-authoritative) → hooks → thin UI components.**

### Domain layer (`app/domain/`) — the heart of the project

Pure, synchronous, deterministic, zero React dependencies. Two complementary patterns:

- **Lenses** (`domain/character/lenses/`, `domain/combat/`) — *read-side*. A `Lens<T, V>` has `get(subject)` / `set(subject, value)`. Every derived stat (skills, characteristics, movement, gear-affected values) is computed fresh from the character via a getter. `set` inverts through the modifiers so the stored *base* value changes, never the derived value. Lens registries are aggregated in `lenses/index.ts` (`skillLenses`, `characteristicLenses`, `movementLenses`), keyed by the corresponding type. Getters compose (e.g. `getStrike` calls `getMelee` + affliction penalties).
- **Commands** (`domain/character/commands/`, `domain/combat/commands/`) — *write-side*. Each exports a pure updater `(character) => character` (often curried, e.g. `addAffliction(key)(c)`). Combat commands operate on the combat state.

Rule invariant: derived wound/stat values scale STR by the size damage-multiplier and add the stored base term unscaled — `floor(0.5 * STR * DM + base)` (see `getTGH`). This form keeps the base at a `+1` coefficient so the generic lens setter inverts at every size. Never add a setter that bypasses this — change the base, not the derived output. (The commented-out `getRES`/`getINS` still use the older `floor((0.5 * STR + base) * DM)`; reconcile them to the current form if you revive them.)

### Types & data ingestion (`domain/types.ts`, `domain/factories.ts`)

- **All types are Zod schemas.** `Character` is a discriminated union of `BaseCharacter` (`type: 'base'`, has `path`, stored as JSON files) and `CampaignCharacter` (`type: 'campaign'`, adds `injuries`/`afflictions`/`resources`, stored in Redis). Narrow with `isBaseCharacter` / `isCampaignCharacter` (`domain/utils.ts`).
- **Ingestion is intentionally lossy/best-effort.** `makeCharacter` / `makeCampaignCharacter` parse arbitrary raw JSON through permissive `*IngestSchema`s, then deep-merge onto a fully-defaulted empty character. Only fields matching type+name survive; unknown keys are stripped. This is deliberate — data shape is versioned and the domain is the authoritative interpreter, so don't add defensive parsing in consumers.
- Game rule tables (afflictions, damage arrays, etc.) live in `domain/tables.ts`.

### State layer (`app/stores/`) — Zustand, deliberately non-authoritative

Zustand only coordinates and bounds memoization/re-renders; it holds no rules.
- `useCharacterStore` — the single character being edited (`edit` tab).
- `useCombatStore` — map of `CampaignCharacter`s in a fight, active character, round/turn.
- `useAppStore` — created via a per-request provider (`appStoreProvider.tsx`, `createAppStore`), holds selected tab and character lists; **must be accessed inside `AppStoreProvider`**.

`useActiveCharacter` is the key indirection: it reads the current tab (`edit` | `play` | `break`) and returns the active character plus a **unified `update(updater)`** that dispatches to the right store. All command/lens hooks go through it, so the same domain logic works identically in editing and combat.

### Hooks (`app/hooks/`)

Thin adapters, one per concern (`useSkillLens`, `useCharacteristicLens`, `useWeaponLens`, `useCharacterCommands`, `useCombatCommands`, …). Pattern: pull the relevant lens/command from the domain, read via `lens.get(character)`, write via `useActiveCharacter().update(...)`. Keep new logic out of hooks — add it to a lens or command and expose it here.

### UI (`app/components/`)

Thin, declarative, Tailwind-only (no CSS files), React 19, `'use client'` where needed. Components render domain projections and call hooks; they do not own or mutate derived state. Main tabs: `CharacterCreator`, `PlayPanel` (combat), `BreakMe` (stress test). Server actions in `app/actions.ts` are the only persistence boundary (Redis for campaign chars, filesystem JSON under `app/characters/<path>/<name>.json` for base chars).

## Conventions

- TypeScript strict; functional components with hooks; `const`/`let`, never `var`.
- Prefer server actions for mutations; client components only when necessary.
- When adding a stat/skill/characteristic: add it to the Zod schema in `types.ts`, write its getter in the relevant `lenses/` file, and register it in `lenses/index.ts`. Many entries are commented out (magic schools, extra characteristics) — uncommenting is how features are staged in.
- New game mechanics: check `rule_graph.json` for name collisions and use the `urn:ttrpg:` namespace when extracting rules. `tools/` holds Python scripts (`extract_rule_graph.py`, `visualize_schema.py`) that generate `rule_graph.json` / `dangling_references.json`.
- On Windows, avoid chained `cmd /c dir && type`; use single commands to reduce process-spawn overhead.

## Roadmap context

`nextSteps.md` (feature ideas) and `README.md` (architecture rationale, tradeoffs, and the "how to change things safely" workflow) hold design intent. `ui-design-patterns.md` contains the instructions for ui.
