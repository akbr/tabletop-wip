import type { Spec } from "../core/spec";
import type { GameStore, StoreUpdate } from "../core/store";

export type GameHost<S extends Spec> = {
  submit: (req: Req<S>) => string | void;
  update: (playerIndex?: number) => void;
};

export type Req<S extends Spec> = {
  playerIndex: number;
  action: S["actions"];
};

export const createGameHost = <S extends Spec>(
  store: GameStore<S>,
  callbacks: {
    onUpdate: (playerIndex: number, gameUpdate: StoreUpdate<S>) => void;
    onErr: (playerIndex: number, gameErr: string) => void;
  }
): GameHost<S> => {
  const reqQueue: Req<S>[] = [];

  let working = false;

  const submit: GameHost<S>["submit"] = (req) => {
    if (working) {
      reqQueue.push(req);
      return;
    }

    const { action, playerIndex } = req;
    const result = store.submit(action, playerIndex);

    working = true;

    if (typeof result === "string") {
      callbacks.onErr(playerIndex, result);
    } else {
      update();
    }

    working = false;

    if (reqQueue.length > 0) {
      submit(reqQueue.shift()!);
    }
  };

  function update(playerIndex?: number) {
    if (playerIndex === undefined) {
      const {
        ctx: { numPlayers },
      } = store.get();

      Array.from({ length: numPlayers }).forEach((_, idx) => {
        callbacks.onUpdate(idx, store.get(idx));
      });
    } else {
      callbacks.onUpdate(playerIndex, store.get(playerIndex));
    }
  }

  return { submit, update };
};
