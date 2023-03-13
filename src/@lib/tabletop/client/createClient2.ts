import { Spec } from "../core/spec";
import { PlayerAction, Ctx } from "../core/game";
import { StoreUpdate } from "../core/store";
import { applyPatches } from "../core/utils";

// Server
export type Err = { type: string; msg: string; date: number };
export type SocketMeta = { avatar?: string; name?: string };
export type SocketsStatus = (SocketMeta | null)[];

type HotUpdate<S extends Spec> = Omit<StoreUpdate<S>, "prevBoard" | "ctx">;

export type ServerRes<S extends Spec> = {
  room: {
    id: string;
    socket: string;
    started: boolean;
    sockets?: SocketsStatus;
  };
  update?: StoreUpdate<S>;
  hotUpdate?: HotUpdate<S>;
  err?: Err;
  historyString?: string;
};

export type GameFrame<S extends Spec> = {
  segment: number;
  frame: number;
  board: S["board"];
  ctx: Ctx<S>;
  action: PlayerAction<S> | null;
  patch: Partial<S["board"]>;
  final: boolean;
};

export type ClientState<S extends Spec> = {
  connected: boolean;
  mode: "title" | "lobby" | "game";
  room: {
    id: string;
    socketIndex: number;
    sockets: SocketsStatus;
  };
  frame: GameFrame<S>;
  err: Err | null;
  historyString?: string;
};

let clientState: any;

function getRes<S extends Spec>(
  res: ServerRes<S>,
  state: ClientState<S>,
  lastFrame?: GameFrame<S>
) {
  const { room, update, hotUpdate } = res;

  const mode = room.id === "" ? "title" : !room.started ? "lobby" : "game";

  const gameUpdate: StoreUpdate<S> | HotUpdate<S> | undefined =
    update || hotUpdate;
  const nextFrames = gameUpdate
    ? getNextFrames(gameUpdate, lastFrame)
    : undefined;

  return {
    state: {
      ...state,
      mode,
      room: updateChangedKeys(clientState.room, room),
      err: fill(state.err, res.err),
      historyString: fill(state.historyString, res.historyString),
    },
    nextFrames,
    needsReset: state.room.id !== res.room.id,
    err: nextFrames && "msg" in nextFrames ? nextFrames : null,
  };
}

function fill<T extends any>(a: T, b: T | undefined) {
  return b ? b : a;
}

function getNextFrames<S extends Spec>(
  update: StoreUpdate<S> | HotUpdate<S>,
  lastFrame?: GameFrame<S>
): GameFrame<S>[] | Err {
  const isHot = !("prevBoard" in update);

  const notHotSynced =
    isHot && (!lastFrame || update.idx !== lastFrame.segment);
  if (notHotSynced) {
    return {
      type: "syncErr",
      msg: "Cannot sync hotUpdate.",
      date: Date.now(),
    };
  }

  const prevBoard = isHot ? lastFrame!.board : update.prevBoard;
  const ctx = isHot ? lastFrame!.ctx : update.ctx;
  const actionIndex = isHot ? 0 : 1;

  const boards = applyPatches(prevBoard, update.patches);
  if (!isHot) boards.unshift(prevBoard);
  const patches = isHot ? update.patches : [prevBoard, ...update.patches];

  const gameFrames: GameFrame<S>[] = boards.map((board, idx) => ({
    board,
    patch: patches[idx],
    segment: update.idx,
    frame: idx,
    ctx,
    action: idx === actionIndex ? update.action || null : null,
    final: update.final,
  }));

  return gameFrames;
}

function updateChangedKeys<O extends Record<string, any>>(o: O, p: Partial<O>) {
  let p2: Partial<O> = {};
  for (let key in p) {
    if (p[key] === undefined) continue;
    if (p[key] !== o[key]) p2[key] = p[key];
  }
  return Object.keys(p2).length > 0 ? { ...o, ...p2 } : o;
}
