/**
 * Converts a string into an array of ASCII codes for each character.
 * @param str - The input string to convert
 * @returns An array of number representing ASCII code of each character
 */
export function string_to_ascii(str: string): number[] {
  // Split string into individual characters and map to their char codes
  return Array.from(str).map(char => char.charCodeAt(0));
}