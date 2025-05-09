import { bytesToHex } from '@noble/hashes/utils';

export const toHex = (u8: Uint8Array): `0x${string}` => `0x${bytesToHex(u8)}`;

export function stringToAsciiArray(str: string, length: number): number[] {
  // Convert string to ASCII values
  const asciiValues = Array.from(str).map((char) => char.charCodeAt(0));
  // Pad with zeros if needed or truncate if too long
  if (asciiValues.length < length) {
    return [...asciiValues, ...Array(length - asciiValues.length).fill(0)];
  }
  if (asciiValues.length > length) {
    return asciiValues.slice(0, length);
  }
  return asciiValues;
}
