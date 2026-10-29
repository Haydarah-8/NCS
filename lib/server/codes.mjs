/* Access codes: typed by hand, so case, spaces and dashes don't matter. Only
   the scrypt hash is ever stored. Plain JavaScript so the setup script can
   use it too. */

import { randomBytes, randomInt, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb);

/** @param {unknown} code */
export const normaliseCode = (code) => String(code ?? "").toUpperCase().replace(/[\s-]+/g, "");

/** @param {unknown} code */
export async function hashCode(code) {
  const salt = randomBytes(16).toString("hex");
  const hash = /** @type {Buffer} */ (await scrypt(normaliseCode(code), salt, 32)).toString("hex");
  return { salt, hash };
}

/** @param {unknown} code @param {any} stored */
export async function checkCode(code, stored) {
  if (!stored?.salt || !stored?.hash) return false;
  const got = /** @type {Buffer} */ (await scrypt(normaliseCode(code), stored.salt, 32));
  const want = Buffer.from(stored.hash, "hex");
  return got.length === want.length && timingSafeEqual(got, want);
}

/* Twelve characters from an alphabet without look-alikes (no 0/O, 1/I/L). */
export function newCode() {
  const ABC = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const group = () => Array.from({ length: 4 }, () => ABC[randomInt(ABC.length)]).join("");
  return `NCS-${group()}-${group()}-${group()}`;
}
