import type { CreateSpec } from "../spec";
import type { Game } from "../game";
import { createReducer, withAction } from "../createReducer";

import { randomIntBetween } from "@lib/random";

export type WarSpec = CreateSpec<{
  phases: "start" | "deal" | "play" | "played" | "end";
  board: {
    activePlayer: number | null;
    hands: number[][];
    table: number[];
  };
  actions: { type: "play"; data: number };
}>;

export type WarGame = Game<WarSpec>;

const getInitialBoard: WarGame["getInitialBoard"] = ({ numPlayers }) => ({
  phase: "start",
  activePlayer: null,
  hands: Array.from({ length: numPlayers }).map(() => []),
  table: [],
  scores: [],
});

const reducer = createReducer<WarSpec>({
  start: () => ({ phase: "deal" }),
  deal: ({ hands }, { seed }) => {
    const nextHands = hands.map((idx) => [randomIntBetween(0, 3, seed + idx)]);
    return { phase: "play", hands: nextHands, activePlayer: 0 };
  },
  play: withAction(
    (action, board) => {
      if (action.player !== board.activePlayer) return "Not your turn!";
      if (board.hands[action.player].indexOf(action.data) === -1)
        return "You don't have that number!";
      return action;
    },
    (board, a) => {
      const table = [...board.table, a.data];
      const hands = board.hands.map((hand, idx) => {
        if (idx !== a.player) return hand;
        return hand.filter((x) => x !== a.data);
      });
      return { phase: "played", table, hands };
    }
  ),
  played: (board, { numPlayers }) => {
    if (board.activePlayer === numPlayers - 1)
      return { phase: "end", activePlayer: null };
    return { phase: "play", activePlayer: board.activePlayer! + 1 };
  },
  end: () => true,
});

export const warGame: WarGame = {
  meta: {
    name: "War",
    players: [2, 4],
  },
  getOptions: () => null,
  getInitialBoard,
  reducer,
  maskPatch: (board, player) => {
    if (board.hands) {
      return {
        ...board,
        hands: board.hands.map((val, i) => (i === player ? val : [])),
      };
    }
  },
  actionKeys: {
    play: null,
  },
};
