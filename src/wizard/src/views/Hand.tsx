import { style } from "@lib/style";
import { Card } from "@shared/components/Card";
import { getPlayedPosition } from "@shared/domEffects/positionTrick";

import {
  HandController,
  HandControllerProps,
} from "@shared/components/HandController";

import { PLAY_DISTANCE } from "./Trick";
import { getTableDimensions } from "./tableDimensions";

import { bundle, ClientGame } from "~src/bundle";
const {
  client: {
    useGame,
    gameActions: { play },
  },
  view: { useGameDimensions },
} = bundle;

const onDrop: HandControllerProps["onDrop"] = ($el, card) => {
  const tableDimensions = getTableDimensions();
  const [x, y, scale] = getPlayedPosition(
    2, // Numplayers irrelevant here.
    0,
    tableDimensions,
    [80, 112],
    PLAY_DISTANCE
  );

  style(
    $el,
    {
      x: x + tableDimensions[2],
      y: y + tableDimensions[3],
      scale,
    },
    { duration: 250 }
  )?.finished.then(() => {
    play(card);
  });
};

const handSelector = ({
  board: { phase, hands },
  playerIndex,
  err,
}: ClientGame) => {
  return {
    hand: hands[playerIndex],
    isDeal: phase === "deal",
    err,
  };
};

export function Hand() {
  const { hand, isDeal, err } = useGame(handSelector);
  const containerDimensions = useGameDimensions();

  return (
    <HandController
      hand={hand}
      isDeal={isDeal}
      containerDimensions={containerDimensions}
      onDrop={onDrop}
      errRef={err}
    >
      {hand.map((id) => (
        <div class="absolute">
          <Card key={id} card={id} />
        </div>
      ))}
    </HandController>
  );
}
