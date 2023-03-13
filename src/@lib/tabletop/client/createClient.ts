import { createEmitter, ReadOnlyEmitter, withSelector } from "@lib/emitter";
import { Meter, createMeter } from "@lib/meter";
import { createSocketManager } from "@lib/socket";

import { Spec } from "../core/spec";
import { PlayerAction, Ctx } from "../core/game";
import { Game } from "../core/game";

import {
  ServerActions,
  actionKeys,
  ServerApi,
  SocketsStatus,
  Err,
  Loc,
} from "../server";

import {
  ActionFns,
  createGameActionFns,
  createServerActionFns,
} from "./createActionFns";

import { applyPatches } from "../core/utils";

export type AppState = {
  connected: boolean;
  err: Err | null;
};

export type RoomState = Loc & { socketsStatus: SocketsStatus };

export type GameState<S extends Spec> = {
  board: S["board"];
  action: PlayerAction<S> | null;
  ctx: Ctx<S>;
};

export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] };

export type ClientState<S extends Spec> = Simplify<
  | { mode: "title" | "lobby" | "game" } & AppState &
      RoomState &
      GameState<S> & { symbol: Symbol; historyString?: string }
>;

export type Client<S extends Spec> = {
  emitter: ReadOnlyEmitter<ClientState<S>>;
  serverActions: ActionFns<ServerActions<S>>;
  gameActions: ActionFns<S["actions"]>;
  gameMeter: Meter<GameState<S> | null>;
  game: Game<S>;
  waitFor: Client<S>["gameMeter"]["waitFor"];
};

function getBlankLoc(): Loc {
  return { id: "", playerIndex: -1, started: false };
}

export function createClient<S extends Spec>(
  server: ServerApi<S> | string,
  game: Game<S>
): Client<S> {
  // Server Response Memory
  // ----------------------
  let connected = false;
  let err: (Err & { date: number }) | null = null;
  let loc: Loc = getBlankLoc();
  let socketsStatus: SocketsStatus = [];
  let gameState: GameState<S> = { board: {} } as unknown as GameState<S>;

  // GameState Memory
  // ----------------
  let _idx = -1;
  let _ctx: Ctx<S> | null = null;
  let _boards: S["board"][] = [];
  let _historyString: string | undefined = undefined;
  let _action: PlayerAction<S> | null = null;
  function resetGameCache() {
    _idx = -1;
    _ctx = null;
    _boards = [];
    _action = null;
    _historyString = undefined;
  }

  const emitter = createEmitter({
    mode: "title",
    connected,
    err,
  } as ClientState<S>);

  function emitState() {
    const appState: AppState = {
      connected,
      err,
    };

    err = null;

    const roomState: RoomState = {
      ...loc,
      socketsStatus,
    };

    const mode: ClientState<S>["mode"] = (() => {
      if (loc.id === "") return "title";
      if (!loc.started) return "lobby";
      return "game";
    })();

    emitter.next({
      mode,
      ...appState,
      ...roomState,
      ...gameState,
      symbol: Symbol(),
      historyString: _historyString,
    });
  }

  const gameMeter = createMeter<GameState<S> | null>(null);

  withSelector(
    gameMeter.emitter,
    (x) => x.state,
    (state) => {
      if (state) {
        gameState = state;
        emitState();
        gameMeter.unlock();
      }
    }
  );

  const socket = createSocketManager(server, {
    onopen: () => {
      connected = true;
      emitState();
    },
    onclose: () => {
      connected = false;
      emitState();
    },
    onmessage: (res) => {
      if (res.err) err = { ...res.err, date: Date.now() };

      if (res.loc === null) {
        loc = getBlankLoc();
        resetGameCache();
        gameMeter.reset(null);
        emitState();
        return;
      }

      if (res.historyString) {
        _historyString = res.historyString;
      }

      const locChanged = !loc || loc.id !== res.loc.id;
      if (locChanged) resetGameCache();

      loc = res.loc;
      socketsStatus = res.socketsStatus || socketsStatus;

      const { update, hotUpdate } = res;

      if (update) {
        let nextBoards = applyPatches(update.prevBoard, update.patches);
        _boards = [update.prevBoard, ...nextBoards];
        _ctx = update.ctx;
        _action = update.action || null;
        _idx = update.idx;
      } else if (hotUpdate) {
        if (!_ctx || hotUpdate.idx !== _idx + 1) {
          // sync err
          err = {
            type: "serverErr",
            msg: "Lost sync with server state.",
            date: Date.now(),
          };
          socket.close();
          return;
        }
        _boards = applyPatches(_boards.at(-1)!, hotUpdate.patches);
        _action = hotUpdate.action || null;
        _idx = hotUpdate.idx;
      }

      if (update || hotUpdate) {
        const meterUpdates = _boards.map((board, idx) => ({
          board,
          action:
            hotUpdate && idx === 0
              ? _action
              : update && idx === 1
              ? _action
              : null, //This is gross, and reflects the fax the preceding action is returned in a different place depending on whether there's an update or hotUpdate
          ctx: _ctx!,
        }));
        const hasState = gameMeter.emitter.get().state;
        if (hasState) gameMeter.pushStates(...meterUpdates);
        if (!hasState) gameMeter.resetStates(...meterUpdates);

        return;
      }

      emitState();
    },
  });

  const serverActions = createServerActionFns(actionKeys, socket) as ActionFns<
    ServerActions<S>
  >;
  const gameActions = createGameActionFns(game, socket) as ActionFns<
    S["actions"]
  >;

  socket.open();

  return {
    emitter,
    serverActions,
    gameActions,
    gameMeter,
    game,
    waitFor: (a) => {
      if (emitter.get().board) {
        gameMeter.waitFor(a);
      }
    },
  };
}

export default createClient;
