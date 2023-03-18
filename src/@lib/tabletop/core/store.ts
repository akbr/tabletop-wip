import type { Spec } from "./spec";
import type { Game, PlayerAction, Ctx } from "./game";
import { is } from "@lib/compare";

export type StoreUpdate<S extends Spec> = {
  idx: number;
  ctx: Ctx<S>;
  prevBoard: S["board"];
  action?: PlayerAction<S>;
  patches: Partial<S["board"]>[];
  final?: boolean;
};

export type History<S extends Spec> = {
  ctx: Ctx<S>;
  actions: PlayerAction<S>[];
};

export type GameStore<S extends Spec> = {
  get: (player?: number) => StoreUpdate<S>;
  submit: (action: S["actions"], player: number) => string | void;
  getHistory: () => History<S>;
};

export type InputCtx<S extends Spec> = {
  numPlayers?: number;
  options?: Ctx<S>["options"];
  seed?: Ctx<S>["seed"];
};

export function createGameStore<S extends Spec>(
  game: Game<S>,
  initCtx?: InputCtx<S>
): GameStore<S> {
  const ctx = validateContext(game, initCtx || {});
  const initialBoard = game.getInitialBoard(ctx);
  const initialUpdate = game.reducer(initialBoard, ctx);

  if (is.string(initialUpdate)) {
    throw new Error(`Error on initialUpdate: ${initialUpdate}`);
  }

  let idx = 0;
  let prevBoard = initialBoard;
  let { boards, patches, final } = initialUpdate;
  let actions: PlayerAction<S>[] = [];

  function applyMask<T extends Partial<S["board"]>>(patch: T, player?: number) {
    if (!game.maskPatch || player === undefined) return patch;
    const mask = game.maskPatch(patch, player);
    return mask ? { ...patch, ...mask } : patch;
  }

  return {
    get: (player) => {
      return {
        idx,
        ctx,
        prevBoard: applyMask(prevBoard, player),
        patches: patches.map((patch) => applyMask(patch, player)),
        final,
        action: actions.at(-1),
      };
    },

    submit: (inputAction, player) => {
      const action = { ...inputAction, player };
      const nextUpdate = game.reducer(boards.at(-1)!, ctx, action);

      if (is.string(nextUpdate)) return nextUpdate;
      if (nextUpdate.boards.length === 0)
        return "Action returned no error but caused no state change.";

      prevBoard = boards.at(-1)!;
      actions.push(action);
      boards = nextUpdate.boards;
      patches = nextUpdate.patches;
      final = nextUpdate.final;
      idx += 1;
    },

    getHistory: () => ({
      ctx,
      actions,
    }),
  };
}

function validateContext<S extends Spec>(
  game: Game<S>,
  ctx: InputCtx<S>
): Ctx<S> {
  const [min, max] = game.meta.players;

  const numPlayers = (() => {
    if (ctx.numPlayers === undefined) return min;
    if (ctx.numPlayers < min) return min;
    if (ctx.numPlayers > max) return max;
    return ctx.numPlayers;
  })();

  const options = game.getOptions(numPlayers, ctx.options);

  return {
    numPlayers,
    seed: ctx.seed ? ctx.seed : `auto_${Date.now()}`,
    options,
  };
}
