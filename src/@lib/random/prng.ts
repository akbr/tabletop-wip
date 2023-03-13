export type PRNG = () => number;
export type Seed = string;

// all this from https://github.com/bryc/code/blob/master/jshash/PRNGs.md

export const createPRNG = (seed?: Seed): PRNG => {
  if (seed === undefined) return Math.random;
  const hash = xmur3a(seed);
  return sfc32(hash(), hash(), hash(), hash());
};

function sfc32(a: number, b: number, c: number, d: number) {
  return function () {
    a |= 0;
    b |= 0;
    c |= 0;
    d |= 0;
    var t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

function xmur3a(str: Seed) {
  for (var k, i = 0, h = 2166136261 >>> 0; i < str.length; i++) {
    k = Math.imul(str.charCodeAt(i), 3432918353);
    k = (k << 15) | (k >>> 17);
    h ^= Math.imul(k, 461845907);
    h = (h << 13) | (h >>> 19);
    h = (Math.imul(h, 5) + 3864292196) | 0;
  }
  h ^= str.length;
  return function () {
    h ^= h >>> 16;
    h = Math.imul(h, 2246822507);
    h ^= h >>> 13;
    h = Math.imul(h, 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}
