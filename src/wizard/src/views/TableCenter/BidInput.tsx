import { useState } from "preact/hooks";
import { checkBid } from "~src/game/logic";

import { bundle } from "~src/bundle";

const {
  client: { useGame, gameActions },
} = bundle;

export function BidInput() {
  const { board, ctx } = useGame();
  const [bid, setBid] = useState(0);

  const bidErr = checkBid(bid, board, ctx.options);

  return (
    <div class="flex flex-col gap-[16px] text-center animate-fadeIn">
      <h3>Enter bid:</h3>
      <div class="flex justify-center items-center gap-[12px]">
        <button
          style={{ minWidth: "36px", minHeight: "36px" }}
          onClick={() => setBid(bid - 1)}
          disabled={bid === 0}
        >
          -
        </button>
        <div class="inline">{bid}</div>
        <button
          style={{ minWidth: "36px", minHeight: "36px" }}
          onClick={() => setBid(bid + 1)}
          disabled={bid === board.round}
        >
          +
        </button>
      </div>
      <button
        style={{ minWidth: "100px" }}
        disabled={Boolean(bidErr)}
        onClick={() => {
          gameActions.bid(bid);
        }}
      >
        Bid
      </button>
    </div>
  );
}
