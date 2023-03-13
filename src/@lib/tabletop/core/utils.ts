import type { Spec } from "./spec";
import type { Ctx, Game } from "./game";
import type { History } from "./store";
import { is } from "@lib/compare";

export function applyPatches<S extends Spec>(
  prev: S["board"],
  patches: Partial<S["board"]>[]
) {
  const boards: S["board"][] = [];
  patches.forEach((patch, idx) => {
    const prior = boards[idx - 1] || prev;
    boards.push({ ...prior, ...patch });
  });
  return boards;
}

export function getCtx<S extends Spec>(game: Game<S>, seed = ""): Ctx<S> {
  const numPlayers = game.meta.players[0];
  const options = game.getOptions(numPlayers);
  return { numPlayers, options, seed };
}

// ---

export type HistoryResults<S extends Spec> = {
  boardSets: S["board"][][];
  final: boolean;
};

export function getHistoryResults<S extends Spec>(
  game: Game<S>,
  history: History<S>
): HistoryResults<S> | string {
  const { ctx, actions } = history;

  const initialBoard = game.getInitialBoard(ctx);
  if (is.string(initialBoard)) return initialBoard;

  const initialUpdate = game.reducer(initialBoard, ctx);

  if (is.string(initialUpdate))
    return `Error on initialUpdate: ${initialUpdate}`;

  const boardSets = [[initialBoard, ...initialUpdate.boards]];
  let final = initialUpdate.final;
  const actionQueue = [...actions];

  while (actionQueue.length > 0) {
    const action = actionQueue.shift()!;
    const prevBoard = boardSets.at(-1)!.at(-1)!;
    const res = game.reducer(prevBoard, ctx, action);
    if (is.string(res)) return res;
    if (res.final && actionQueue.length > 0) return `Premtature final`;
    final = res.final;
    const boards = applyPatches(prevBoard, res.patches);
    boardSets.push(boards);
  }

  return {
    boardSets,
    final,
  };
}
