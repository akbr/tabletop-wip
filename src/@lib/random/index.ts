import { createPRNG } from "./prng";

export const random = (seed?: string): number => createPRNG(seed)();

export function randomBetween(n1: number, n2: number, seed?: string) {
  const max = n1 > n2 ? n1 : n2;
  const min = n1 === max ? n2 : n1;
  return random(seed) * (max - min) + min;
}

export function randomIntBetween(n1: number, n2: number, seed?: string) {
  const max = n1 > n2 ? n1 : n2;
  const min = n1 === max ? n2 : n1;
  return Math.floor(random(seed) * (max - min + 1) + min);
}

export function randomFromArray<T>(arr: T[], seed?: string) {
  if (arr.length === 1) return arr[0];
  const index = Math.round(randomBetween(0, arr.length - 1, seed));
  return arr[index];
}
