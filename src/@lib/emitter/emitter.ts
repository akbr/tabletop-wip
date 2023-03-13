import { shallow } from "../compare";

export type Listener<T> = (curr: T, prev: T) => void;

export interface ReadOnlyEmitter<T> {
  subscribe: (listener: Listener<T>) => () => void;
  get: () => T;
}

export interface Emitter<T> extends ReadOnlyEmitter<T> {
  next: (state: T) => void;
}

const defaultOptions = {
  isEqual: ((a: any, b: any) => a === b) as
    | ((a: any, b: any) => boolean)
    | undefined,
};

export function createEmitter<T>(
  initial: T,
  options = defaultOptions
): Emitter<T> {
  const listeners: Set<Listener<T>> = new Set();

  let curr = initial;
  let prev = initial;

  return {
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    next: (state) => {
      prev = curr;
      curr = state;
      if (options.isEqual && options.isEqual(curr, prev)) return;
      listeners.forEach((fn) => fn(curr, prev));
    },
    get: () => curr,
  };
}

export default createEmitter;

export type Selector<T, U> = (curr: T) => U;
export function withSelector<T, U>(
  { subscribe }: ReadOnlyEmitter<T>,
  selector: Selector<T, U>,
  listener: Listener<U>,
  isEqual = shallow
) {
  let first = true;
  return subscribe((curr, prev) => {
    const selectedCurr = selector(curr);
    const selectedPrev = selector(prev);

    if (first || !isEqual(selectedCurr, selectedPrev)) {
      first = false;
      listener(selectedCurr, selectedPrev);
    }
  });
}
