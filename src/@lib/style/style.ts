import { Task } from "../async/task";

export type Value = string | number;

interface BaseStyles
  extends Omit<CSSStyleDeclaration, "direction" | "transition"> {}

interface TransformShorthands {
  x?: Value;
  y?: Value;
  scale?: Value | Value[];
  rotate?: Value | Value[];
}

export type SingleFrame = {
  [K in keyof BaseStyles]?: Value | Value[];
} & TransformShorthands;

export type MultiFrame = {
  [K in keyof BaseStyles]?: Value;
} & TransformShorthands;

export type Options = {
  [K in keyof KeyframeAnimationOptions]?: Value;
};

export function style(
  $el: Element,
  styleFrames: SingleFrame | MultiFrame[],
  options?: Options
) {
  // Parse keyframes for values
  const valueFrames = !Array.isArray(styleFrames)
    ? convertFrameValues(styleFrames)
    : styleFrames.map(convertFrameValues);

  // Parse keyframes for transforms
  const parsedKeyframes = !Array.isArray(valueFrames)
    ? patchTransforms(valueFrames)
    : valueFrames.map(patchTransforms);

  // Get commit styles
  const commitStyle = getCommitStyles(
    Array.isArray(parsedKeyframes)
      ? parsedKeyframes[parsedKeyframes.length - 1]
      : parsedKeyframes
  );

  if (!options) {
    setStyles($el, commitStyle);
    return;
  }

  if (!options.easing) {
    options.easing = "ease";
  }

  return createAnimationTask($el, parsedKeyframes, commitStyle, options);
}

export default style;

// --

const to = (unit: string) => (n: number) => `${n}${unit}`;
const unitGlossary: Record<string, (n: number) => string> = {
  x: to("px"),
  y: to("px"),
  rotate: to("deg"),
  top: to("px"),
  left: to("px"),
  right: to("px"),
  bottom: to("px"),
  width: to("px"),
  height: to("px"),
};

const convertValue = (key: string, value: Value) => {
  if (typeof value === "string") return value;
  if (unitGlossary[key]) return unitGlossary[key](value);
  return String(value);
};

function convertFrameValues(block: SingleFrame | MultiFrame) {
  const next: Record<string, string | string[]> = {};

  for (let key in block) {
    //@ts-ignore
    const value = block[key];
    if (value === undefined) continue;
    const nextValue = Array.isArray(value)
      ? value.map((subValue) => convertValue(key, subValue))
      : convertValue(key, value);
    next[key] = nextValue;
  }

  return next;
}

// ---

export function patchTransforms(styles: Record<string, string | string[]>) {
  const { x, y, ...nextStyles } = styles;

  if ([x, y].find(Array.isArray))
    throw new Error("Array keyframes translate transforms not yet supported.");

  const transforms: Record<string, any> = {};

  if (x !== undefined || y !== undefined) {
    transforms.translate = `${x || 0} ${y || 0}`;
  }

  return {
    ...nextStyles,
    ...transforms,
  };
}

// ---

const SPECIAL_KEYS = new Set(["offset", "easing", "composite"]);
function getCommitStyles(
  styles: Record<string, string | string[]> | Record<string, string>
) {
  const commitStyles: Record<string, string> = {};

  for (let key in styles) {
    if (SPECIAL_KEYS.has(key)) continue;

    const value = styles[key];

    if (Array.isArray(value)) {
      commitStyles[key] = value[value.length - 1];
    } else {
      commitStyles[key] = value;
    }
  }

  return commitStyles;
}

// ---

export function setStyles($el: Element, styles: Record<string, string>) {
  for (const key in styles) {
    ($el as HTMLElement).style[key as any] = styles[key];
  }
}

// ---

export function createAnimationTask(
  $el: Element,
  styles: Record<string, any>,
  commitStyles: Record<string, string>,
  options: Options
): Task<Animation> {
  let done = false;

  const anim = $el.animate(styles, options as KeyframeAnimationOptions);

  const setDone = () => {
    done = true;
    setStyles($el, commitStyles);
  };

  anim.finished.then(() => {
    if (done) return;
    setDone();
  });

  return {
    finished: anim.finished,
    finish: () => {
      if (done) return;
      setDone();
      anim.finish();
    },
  };
}
