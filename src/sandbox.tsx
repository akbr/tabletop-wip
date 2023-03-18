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
import { createEffect, For } from "solid-js";
import { getBoards } from "@lib/tabletop/core/utils";
import { render } from "solid-js/web";
import emitter, { createEmitter } from "@lib/emitter";

type ClientUpdate<S extends Spec> = StoreUpdate<S> & {
  player: number;
  boards: S["board"][];
};

function createClient<S extends Spec>(game: Game<S>, inputCtx?: InputCtx<S>) {
  let player = 0;
  let boards: S["board"][] = [];

  let gameStore = createGameStore(game, inputCtx);
  let host = createGameHost(gameStore, {
    onUpdate: (thisPlayer, update) => {
      if (thisPlayer === player) emitter.next(getClientUpdate(update));
    },
    onErr: () => {},
  });

  function getClientUpdate(update: StoreUpdate<S>): ClientUpdate<S> {
    const nextBoards = getBoards(update);
    boards = boards.concat(nextBoards);
    return { boards, player, ...update };
  }

  const emitter = createEmitter(getClientUpdate(gameStore.get(player)));

  return {
    emitter,
    setPlayer: (num: number) => {
      player = num;
      boards = [];
      host.update();
    },
    submit: host.submit,
  };
}

const client = createClient(warGame, { numPlayers: 2 });

function clone<T extends {}>(x: T) {
  return structuredClone(x) as T;
}
const [store, set] = createStore(clone(client.emitter.get()));
client.emitter.subscribe((update) => {
  set(reconcile(update, { key: null }));
});

const props = store;

function App() {
  return (
    <div>
      <div>Using player: {props.player}</div>
      <button
        onClick={() => {
          client.submit({
            playerIndex: 0,
            action: { type: "play", data: props.patches[1].hands[0][0] },
          });
        }}
      >
        Next
      </button>
      <For each={props.boards}>
        {(board) => <div>{JSON.stringify(board)}</div>}
      </For>
    </div>
  );
}

render(() => <App />, document.body);
