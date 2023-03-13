import { CreateSpec } from "@lib/tabletop";

export type WizardSpec = CreateSpec<{
  phases:
    | "roundStart"
    | "deal"
    | "trumpReveal"
    | "select"
    | "selected"
    | "bid"
    | "bidded"
    | "bidsEnd"
    | "play"
    | "played"
    | "trickWon"
    | "roundEnd"
    | "end";
  board: {
    round: number;
    player: number | null;
    dealer: number;
    trumpCard: string | null;
    trumpSuit: string | null;
    bids: (number | null)[];
    actuals: number[];
    hands: string[][];
    trick: string[];
    trickLeader: number;
    trickWinner: number | null;
    scores: number[][];
  };
  actions:
    | { type: "select"; data: string }
    | { type: "bid"; data: number }
    | { type: "play"; data: string };
  options: { canadian: boolean; numRounds: number; startRound: number };
}>;
