import type { BotFn } from "@lib/tabletop/";
import type { WizardSpec } from "./spec";

import { randomFromArray } from "@lib/random";
import { checkBid, getPlayableCards } from "./logic";

export const wizardBotFn: BotFn<WizardSpec> = (board, ctx, playerIndex) => {
  const isMyTurn = playerIndex === board.player;
  if (!isMyTurn) return;

  if (board.phase === "select") {
    return { type: "select", data: randomFromArray(["c", "d", "h", "s"]) };
  }

  if (board.phase === "bid") {
    const lowestPossibleBid = !!checkBid(0, board, ctx.options) ? 1 : 0;
    return { type: "bid", data: lowestPossibleBid };
  }

  if (board.phase === "play") {
    const playable = getPlayableCards(board.hands[playerIndex], board.trick);
    return { type: "play", data: randomFromArray(playable) };
  }
};
