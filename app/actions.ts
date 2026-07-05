"use server"

import { Character } from './domain/types';
import { isBaseCharacter } from './domain/utils';
import redis from './redis'
import fs from "fs";
import path from "path";


export type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];

export interface JsonObject {
  [key: string]: JsonValue;
}

// Every action returns a discriminated result instead of swallowing failures,
// so the client can surface them (see the sonner toasts in the callers).
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function loadJsonFromFolder(baseDir: string): Promise<JsonObject> {
  const result: JsonObject = {};

  const entries = fs.readdirSync(baseDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(baseDir, entry.name);

    if (entry.isDirectory()) {
      // Recursively load subfolders
      result[entry.name] = await loadJsonFromFolder(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      // Remove .json extension
      const key = path.basename(entry.name, ".json");
      const content = JSON.parse(fs.readFileSync(fullPath, "utf-8")) as JsonValue;
      result[key] = content;
    }
  }

  return result;
}



export async function getBasicCharList(): Promise<ActionResult<JsonObject>> {
  try {
    const dataDir = path.join(process.cwd(), "app/characters");
    const characterData = await loadJsonFromFolder(dataDir);
    return { ok: true, data: characterData };
  } catch (err) {
    console.error('Error loading base character list:', err);
    return { ok: false, error: 'Failed to load base characters.' };
  }
}

export async function upsertBaseCharacter(data: Character): Promise<ActionResult> {
  if (!isBaseCharacter(data)) return { ok: false, error: 'Not a base character.' };

  // Base characters are dev-authored blueprints; their unique name *is* their
  // identity on disk, so the campaign uuid is intentionally dropped here.
  const { id, ...character } = data;
  void id;

  try {
    const targetDir = path.join('app/characters', character.path);

    // Ensure the directory exists
    fs.mkdirSync(targetDir, { recursive: true });

    // Write the file (pretty-printed) as <path>/<name>.json
    const filePath = path.join(targetDir, `${character.name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(character, null, 2), "utf-8");

    console.log(`✅ Created: ${filePath}`);
    return { ok: true, data: undefined };
  } catch (err) {
    console.error('Error writing base character:', err);
    return { ok: false, error: 'Failed to save base character.' };
  }
}

export async function deleteBaseCharacter(
  folderPath: string,
  fileName: string
): Promise<ActionResult> {
  // folderPath is relative to app/characters (e.g. "topKey/midKey").
  const filePath = path.join('app/characters', folderPath, `${fileName}.json`);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Deleted: ${filePath}`);
      return { ok: true, data: undefined };
    }
    console.warn(`⚠️ File not found: ${filePath}`);
    return { ok: false, error: 'Base character file not found.' };
  } catch (err) {
    console.error('Error deleting base character:', err);
    return { ok: false, error: 'Failed to delete base character.' };
  }
}


export async function saveCharacter(character: Character): Promise<ActionResult> {
  try {
    const list: {id: string, name: string}[] = (await redis.get('charList')) ?? [];
    if(!list.some(el => el.id === character.id)){
      await redis.set('charList', [...list, {id: character.id, name: character.name}]);
    }

    await redis.set(character.id, character);
    return { ok: true, data: undefined };
  } catch (err) {
    console.error('Error saving character to Redis:', err);
    return { ok: false, error: 'Failed to save character.' };
  }
}

export async function deleteCharacter(id: string): Promise<ActionResult> {
  try {
    const list: {id: string, name: string}[] = (await redis.get('charList')) ?? [];
    await redis.set('charList', list.filter(el => el.id !== id));
    await redis.del(id);
    return { ok: true, data: undefined };
  } catch (err) {
    console.error('Error deleting character from Redis:', err);
    return { ok: false, error: 'Failed to delete character.' };
  }
}

export async function getCharacter(id: string): Promise<ActionResult<Character | null>> {
  try {
    const character: Character | null = await redis.get(id);
    return { ok: true, data: character };
  } catch (err) {
    console.error('Error getting character from Redis:', err);
    return { ok: false, error: 'Failed to load character.' };
  }
}


export async function getCharacterList(): Promise<ActionResult<{id: string, name: string}[]>> {
  try {
    const list: {id: string, name: string}[] | null = await redis.get('charList');
    return { ok: true, data: list ?? [] };
  } catch (err) {
    console.error('Error getting character list from Redis:', err);
    return { ok: false, error: 'Failed to load character list.' };
  }
}
