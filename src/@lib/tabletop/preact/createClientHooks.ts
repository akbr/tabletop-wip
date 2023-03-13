import { createUseEmitter, ReadOnlyEmitter, Listener } from "@lib/emitter";
import { Client } from "../client";
import { Spec } from "../core";

export function createClientHooks<S extends Spec>(client: Client<S>) {
  return {
    useClient: createUseEmitter(client.emitter),
    useTitle: useClientTitle(client),
    useLobby: useClientLobby(client),
    useGame: useClientGame(client),
  };
}

// This hack is useful so hooks don't crash when the state mode changes underneath them.
// This happens, e.g., when going from mode:game -> mode:title.
export function createFilteredEmitter<T, U>(
  sourceEmitter: ReadOnlyEmitter<T>,
  filterFn: (state: T) => U | void
) {
  return {
    get: () => {
      const state = filterFn(sourceEmitter.get());
      if (state === undefined)
        throw new Error(
          "Invalid hook instantiation. You probably tried to use a mode-specific hook at the wrong time."
        );
      return state;
    },
    subscribe: (fn: Listener<U>) => {
      return sourceEmitter.subscribe((curr, prev) => {
        const myCurr = filterFn(curr);
        if (myCurr === undefined) return;
        const myPrev = filterFn(prev);
        fn(myCurr, myPrev === undefined ? myCurr : myPrev);
      });
    },
  } as unknown as ReadOnlyEmitter<NonNullable<U>>;
}

export function useClientTitle<S extends Spec>(client: Client<S>) {
  const filteredEmitter = createFilteredEmitter(client.emitter, (state) => {
    if (state.mode === "title") return state;
  });
  return createUseEmitter(filteredEmitter);
}

export function useClientLobby<S extends Spec>(client: Client<S>) {
  const filteredEmitter = createFilteredEmitter(client.emitter, (state) => {
    if (state.mode === "lobby") return state;
  });
  return createUseEmitter(filteredEmitter);
}

export function useClientGame<S extends Spec>(client: Client<S>) {
  const filteredEmitter = createFilteredEmitter(client.emitter, (state) => {
    if (state.mode === "game") return state;
  });
  return createUseEmitter(filteredEmitter);
}
