import { Character } from "../../types";
import { getSTR } from "./characteristics";
import { getDM } from "./helpers";


export const getTGH = (c: Character) => Math.floor(0.5 * getSTR(c) * getDM(c) + c.TGH)

export const getSize = (c: Character) => c.size > 6 ? 7 : c.size < 2 ? 1 : c.size