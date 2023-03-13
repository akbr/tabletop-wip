import { bundle } from "../bundle";
import { getHandHeight } from "@shared/domEffects/positionHand";

export const TABLE_MAX_WIDTH = 700;
export const BADGE_PADDING = [12, 12];
export const BADGE_DIMENSIONS = [50, 72];

const {
  client: { emitter, useGame },
  view: { useGameDimensions, getGameDimensions },
} = bundle;

export const getTableDimensions = (
  dimensions?: ReturnType<typeof getGameDimensions>
) => {
  const [width, height] = dimensions || getGameDimensions();

  const state = emitter.get();
  if (state.mode !== "game") return [0, 0, 0, 0];

  const numCards = state.board.hands[state.playerIndex].length || 1;

  const tableW = Math.min(TABLE_MAX_WIDTH, width);
  const widthDiff = width - tableW;
  const handHeight = getHandHeight(numCards, tableW);

  return [tableW, height - handHeight, widthDiff / 2, 0];
};

export const useTableDimensions = () => {
  const dimensions = useGameDimensions();
  useGame((s) => [s.board.hands[s.playerIndex].length, s.ctx.numPlayers]);
  return getTableDimensions(dimensions);
};
