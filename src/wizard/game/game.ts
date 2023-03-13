import type { Game } from "@lib/tabletop";

import { WizardSpec } from "./spec";
import { wizardReducer, getNextRound } from "./reducer";
import { wizardBotFn } from "./botFn";

export const wizardGame: Game<WizardSpec> = {
  meta: {
    name: "Wizard",
    players: [2, 6],
  },
  getOptions: (
    numPlayers,
    o = { canadian: true, numRounds: 60 / numPlayers, startRound: 1 }
  ) => {
    const maxRounds = 60 / numPlayers;
    const numRounds = o.numRounds > maxRounds ? maxRounds : o.numRounds;
    const startRound = (() => {
      if (o.startRound === undefined) return 1;
      if (o.startRound < 1) return 1;
      if (o.startRound > numRounds) return numRounds;
      return o.startRound;
    })();

    return {
      ...o,
      numRounds,
      startRound,
    };
  },
  getInitialBoard: getNextRound,
  reducer: wizardReducer,
  actionKeys: {
    bid: null,
    play: null,
    select: null,
  },
  maskPatch: (patch, playerIndex) => {
    if (patch.hands) {
      return {
        hands: patch.hands.map((hand, idx) =>
          idx === playerIndex ? hand : []
        ),
      };
    }
  },
  botFn: wizardBotFn,
};
export default wizardGame;
