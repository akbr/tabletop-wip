import { createReducer, Ctx, withAction } from "@lib/tabletop";
import { rotateIndex } from "@lib/array";

import { WizardSpec } from "./spec";
import { getDeal, getWinningIndex, getPlayableCards, checkBid } from "./logic";

export const getNextRound = (
  { numPlayers, options }: Ctx<WizardSpec>,
  board = {} as WizardSpec["board"]
) => {
  const dealer =
    board.dealer !== undefined ? rotateIndex(numPlayers, board.dealer, 1) : 0;
  const scores = board.scores
    ? ([...board.scores, board.bids, board.actuals] as number[][])
    : [];
  const round =
    board.round === undefined ? options.startRound : board.round + 1;

  const nextRound: WizardSpec["board"] = {
    phase: "roundStart",
    player: null,
    round,
    dealer,
    hands: Array.from({ length: numPlayers }, () => []),
    trumpCard: null,
    trumpSuit: null,
    trick: [],
    trickLeader: rotateIndex(numPlayers, dealer, 1),
    trickWinner: null,
    bids: Array.from({ length: numPlayers }, () => null),
    actuals: Array.from({ length: numPlayers }, () => 0),
    scores,
  };

  return nextRound;
};

export const wizardReducer = createReducer<WizardSpec>({
  roundStart: (b, c) => {
    const { hands } = getDeal(c.numPlayers, b.round, c.seed + b.round);

    return {
      phase: "deal",
      hands,
    };
  },

  deal: (b, c) => {
    const { trumpCard, trumpSuit } = getDeal(
      c.numPlayers,
      b.round,
      c.seed + b.round
    );

    return {
      phase: "trumpReveal",
      trumpCard,
      trumpSuit,
    };
  },

  trumpReveal: (b, c) =>
    b.trumpSuit === "w"
      ? { phase: "select", player: b.dealer }
      : {
          phase: "bid",
          player: rotateIndex(c.numPlayers, b.dealer, 1),
        },

  select: withAction(
    (a, b) => {
      if (a.player !== b.player) return "It's not your turn.";
      if (a.type !== b.phase) return "Invalid action type.";
      if (!["c", "d", "h", "s"].includes(a.data)) return "Invalid suit.";
      return a;
    },
    (b, a, c) => ({
      phase: "selected",
      trumpSuit: a.data,
      player: rotateIndex(c.numPlayers, b.dealer, 1),
    })
  ),

  selected: (b) => ({
    phase: "bid",
  }),

  bid: withAction(
    (a, b, c) => {
      if (a.type !== b.phase || a.player !== b.player)
        return "Wrong action. (Waiting on a bid.)";
      const bidErr = checkBid(a.data, b, c.options);
      if (bidErr) return bidErr;
      return a;
    },
    (b, a) => {
      const nextBids = b.bids.map((bid, i) => (i === a.player ? a.data : bid));
      return { phase: "bidded", bids: nextBids };
    }
  ),

  bidded: (b, c) =>
    b.bids.includes(null)
      ? { phase: "bid", player: rotateIndex(c.numPlayers, b.player!, 1) }
      : { phase: "bidsEnd", player: null },

  bidsEnd: (b, c) => ({
    phase: "play",
    player: rotateIndex(c.numPlayers, b.dealer, 1),
  }),

  play: withAction(
    (a, b) => {
      if (a.type !== b.phase || a.player !== b.player)
        return "Wrong action. (Waiting on a card.)";
      const hand = b.hands[a.player];
      if (!hand.includes(a.data)) return "You don't have that card.";
      if (!getPlayableCards(hand, b.trick).includes(a.data))
        return "Illegal play.";
      return a;
    },

    (b, a, c) => {
      const nextHands = b.hands.map((hand, i) =>
        i === a.player! ? hand.filter((card) => card !== a.data) : hand
      );
      const nextTrick = [...b.trick, a.data];

      return [
        {
          phase: "played",
          hands: nextHands,
          trick: nextTrick,
          player: null,
        },
        nextTrick.length < c.numPlayers
          ? { phase: "play", player: rotateIndex(c.numPlayers, b.player!, 1) }
          : {
              phase: "trickWon",
              player: null,
              trickWinner: rotateIndex(
                c.numPlayers,
                getWinningIndex(nextTrick, b.trumpSuit),
                b.trickLeader
              ),
            },
      ];
    }
  ),

  trickWon: (b) => {
    const roundContinues = b.hands[0].length > 0;
    const nextActuals = b.actuals.map((n, idx) =>
      idx === b.trickWinner ? n + 1 : n
    );

    if (roundContinues) {
      return {
        phase: "play",
        actuals: nextActuals,
        trick: [],
        trickLeader: b.trickWinner!,
        trickWinner: null,
        player: b.trickWinner,
      };
    }

    return {
      phase: "roundEnd",
      actuals: nextActuals,
      trick: [],
      trickWinner: null,
    };
  },

  roundEnd: (b, c) => {
    const gameContinues = c.options.numRounds !== b.round;

    return gameContinues
      ? getNextRound(c, b)
      : {
          phase: "end",
          scores: [...b.scores, b.bids, b.actuals] as number[][],
        };
  },

  end: () => true,
});
