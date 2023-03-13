import { useLayoutEffect, useRef } from "preact/hooks";
import { getTotalBids } from "../../../game/logic";
import { Twemoji } from "@shared/components/Twemoji";
import style from "@lib/style";
import { delay, seq } from "@lib/async/task";

import { bundle } from "~src/bundle";
const {
  client: { waitFor },
} = bundle;

export function BidsEnd({
  bids,
  round,
}: {
  bids: (number | null)[];
  round: number;
}) {
  const ref = useRef(null);
  const diff = round - getTotalBids(bids);
  const emoji = diff > 0 ? "⬇️" : diff < 0 ? "⬆️" : "👍";

  useLayoutEffect(() => {
    waitFor(fadeInOut(ref.current!));
  }, []);

  return (
    <div ref={ref} class="flex flex-col items-center gap-2 max-w-[140px]">
      <h3 class="text-center">
        {diff > 0
          ? `Underbid by ${diff}`
          : diff < 0
          ? `Overbid by ${Math.abs(diff)}`
          : "Even bids"}
      </h3>

      <Twemoji char={emoji} size={32} />
    </div>
  );
}

function fadeInOut($el: HTMLElement) {
  style($el, {
    y: -24,
  });

  return seq([
    () =>
      style(
        $el,
        {
          opacity: [0, 1],
          y: 0,
        },
        { duration: 1000 }
      ),
    () =>
      style(
        $el,
        {
          opacity: [1, 0],
          y: 10,
        },
        { duration: 500, delay: 1000 }
      ),
    () => delay(300),
  ]);
}
