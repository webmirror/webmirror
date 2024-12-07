import { decodeBase32 as stdDecodeBase32 } from "@std/encoding";

export function decodeBase32(b32: string): Uint8Array {
  const mod = b32.length % 8;
  const b32padded = (mod !== 0) ? (b32 + "=".repeat(8 - mod)) : b32;
  return stdDecodeBase32(b32padded.toUpperCase());
}

export { decodeBase64, encodeBase32, encodeBase64 } from "@std/encoding";
