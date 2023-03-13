import {
  createGameStore,
  GameStore,
  InputCtx,
  StoreUpdate,
} from "@lib/tabletop/core/store";
import { createGameHost } from "@lib/tabletop/server/createGameHost";
import { warGame } from "@lib/tabletop/core/sample/war.game";
import { Game, Spec } from "@lib/tabletop";
import { createStore, reconcile } from "solid-js/store";
import { createEffect } from "solid-js";

function createClient<S extends Spec>(game: Game<S>, inputCtx: InputCtx<S>) {
  let myPlayer = 0;

  let gameStore = createGameStore(game, inputCtx);
  let host = createGameHost(gameStore, {
    onUpdate: (player, update) => {
      console.log("!", update);
      if (player !== myPlayer) return;
      updateStore(update);
    },
    onErr: () => {},
  });

  const [store, set] = createStore(gameStore.get(myPlayer));

  function updateStore(update: StoreUpdate<S>) {
    set(reconcile(update));
  }

  return {
    store,
    setPlayer: (num: number) => {
      myPlayer = num;
      host.update();
    },
    submit: host.submit,
  };
}

const client = createClient(warGame, { numPlayers: 2 });

createEffect(() => {
  console.log(client.store);
});

console.log(
  client.submit({ type: "play", data: client.store.patches[1].hands[0][0] }, 0)
);
