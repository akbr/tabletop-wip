import { rotateIndex } from "@lib/array";
import { PositionSeats } from "@shared/components/PositionSeats";
import { getSeatCSSDirection } from "@shared/domEffects/positionSeats";
import { h } from "preact";

import { getScore } from "~src/game/logic";
import { Seat, SeatProps, WizardAlert, WizardDisplay } from "./Seat";

import { bundle, ClientGame } from "~src/bundle";
const {
  client: { useGame },
} = bundle;

export function Seats() {
  const [playerIndex, numPlayers] = useGame((x) => [
    x.playerIndex,
    x.ctx.numPlayers,
  ]);

  return (
    <section id="seats" class="relative h-full">
      <PositionSeats perspective={playerIndex}>
        {Array.from({ length: numPlayers }).map((_, idx) => (
          <_Seat
            playerIndex={idx}
            perspectiveIndex={rotateIndex(numPlayers, idx, -playerIndex)}
          />
        ))}
      </PositionSeats>
    </section>
  );
}

const seatProps =
  (playerIndex: number, perspectiveIndex: number) =>
  (state: ClientGame): SeatProps => {
    const { board, ctx, socketsStatus } = state;
    const { avatar } = socketsStatus[playerIndex] || {};

    const biddingActive = ["bid", "bidded", "bidsEnd"].includes(board.phase);
    const bid = board.bids[playerIndex];
    const actual = board.actuals[playerIndex];

    const display = ((): WizardDisplay | undefined => {
      if (!biddingActive && bid !== null && actual !== undefined) {
        return { type: "bidProgress", data: [bid, actual] };
      }
    })();

    const alert = ((): WizardAlert | undefined => {
      if (
        ["roundStart", "deal"].includes(board.phase) &&
        board.dealer === playerIndex
      )
        return { type: "dealBubble" };
      if (board.phase === "trumpReveal" && board.dealer === playerIndex)
        return { type: "trumpBubble" };
      if (biddingActive && bid !== null)
        return { type: "bidBubble", data: bid };
      if (board.player === playerIndex) return { type: "waiting" };
      if (board.phase === "roundEnd")
        return { type: "scoreBubble", data: getScore(bid!, actual!) };
    })();

    return {
      playerIndex,
      avatar,
      direction: getSeatCSSDirection(ctx.numPlayers, perspectiveIndex),
      isDealer: board.dealer === playerIndex,
      display,
      alert,
    };
  };

function _Seat({
  playerIndex,
  perspectiveIndex,
}: {
  playerIndex: number;
  perspectiveIndex: number;
}) {
  const selector = seatProps(playerIndex, perspectiveIndex);
  const props = useGame(selector);
  return h(Seat, props);
}

export default Seats;
