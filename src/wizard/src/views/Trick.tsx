import { useLayoutEffect, useRef } from "preact/hooks";
import { useShallowRef } from "@lib/hooks";
import { Vec } from "@lib/vector";
import { stageTrick } from "@shared/domEffects/stageTrick";
import { Card } from "@shared/components/Card";

import {
  BADGE_PADDING,
  BADGE_DIMENSIONS,
  useTableDimensions,
} from "./tableDimensions";

import { bundle } from "~src/bundle";
const {
  client: { useGame, waitFor },
} = bundle;

export const PLAY_DISTANCE = Vec.add(
  BADGE_DIMENSIONS,
  Vec.mul(BADGE_PADDING, 2)
);

export const Trick = () => {
  const tableDimensions = useTableDimensions();
  const ref = useRef(null);

  const { board, ctx, playerIndex, action } = useGame();
  const { phase, trickWinner, trick, trickLeader } = board;

  const effect = useShallowRef(
    (() => {
      if (phase === "played") {
        return {
          type: "played",
          player: action?.player!,
        } as const;
      }

      if (phase === "trickWon") {
        return {
          type: "won",
          player: trickWinner!,
        } as const;
      }
    })()
  );

  useLayoutEffect(() => {
    waitFor(
      stageTrick(
        ref.current!,
        tableDimensions,
        {
          numPlayers: ctx.numPlayers,
          leadPlayer: trickLeader,
          perspective: playerIndex,
        },
        PLAY_DISTANCE,
        effect
      )
    );
  }, [effect, trick, tableDimensions]);

  return (
    <section ref={ref} id="trick" class="absolute top-0 left-0">
      {trick.map((cardId) => (
        <div key={cardId} class="absolute">
          <Card key={"trick-" + cardId} card={cardId} />
        </div>
      ))}
    </section>
  );
};
