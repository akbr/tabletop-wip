import { useLayoutEffect, useRef } from "preact/hooks";

import { style } from "@lib/style";
import { getNearestDimensions } from "@lib/dom";
import { seq } from "@lib/async/task";
import { randomBetween } from "@lib/random";

import { Card, splitCard } from "@shared/components/Card";

import { bundle } from "~src/bundle";
const {
  client: { waitFor },
} = bundle;

const revealEffect = ($card: HTMLElement, suit: string) => {
  const [width, height] = getNearestDimensions($card.parentElement!);
  const $suit = $card.querySelector("#suit")!;
  const isWild = ["w", "j"].includes(suit);

  return seq([
    () =>
      style($card, {
        x: 0,
        y: 0,
        scale: 1.25,
        opacity: 0,
        rotate: randomBetween(-20, 20),
      }),
    () =>
      style(
        $card,
        { scale: 1, opacity: 1, rotate: randomBetween(-10, 10) },
        { duration: 500, delay: 500 }
      ),
    () =>
      !isWild
        ? style(
            $suit,
            { scale: 1.5, rotate: randomBetween(-24, 24) },
            {
              duration: 500,
              delay: 500,
            }
          )
        : undefined,
    () =>
      !isWild
        ? style(
            $suit,
            { scale: 1, rotate: 0 },
            {
              duration: 500,
              delay: 400,
            }
          )
        : undefined,
    () =>
      style(
        $card,
        {
          x: width / 2 + 100,
          y: -height / 2 - 100,
          rotate: 250,
          opacity: [1, 1, 0],
        },
        { duration: 600, delay: 850 }
      ),
  ]);
};

export const TrumpReveal = ({ cardId }: { cardId: string }) => {
  const { suit } = splitCard(cardId);
  const ref = useRef(null);

  useLayoutEffect(() => {
    waitFor(revealEffect(ref.current!, suit));
  }, [suit]);

  return (
    <div ref={ref}>
      <Card card={cardId} />
    </div>
  );
};
