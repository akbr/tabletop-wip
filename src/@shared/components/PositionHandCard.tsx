import { ComponentChildren } from "preact";
import { useState, useRef, useLayoutEffect } from "preact/hooks";
import { useDrag } from "@use-gesture/react";

import { style } from "@lib/style";

import { getHandCardPosition } from "@shared/domEffects/positionHand";
import { randomBetween } from "@lib/random";

export type PositionHandCardProps = {
  idx: number;
  numCards: number;
  card: string;
  isDeal: boolean;
  waitFor: Function;
  shouldDrop: (mx: number, my: number) => boolean;
  onDrop: (
    $el: HTMLElement,
    card: string,
    numCards: number,
    cardPos: number[],
    dragPos: number[]
  ) => void;
  errRef: any;
  containerDimensions: number[];
  cardWidth: number;
  resizeSymbol: Symbol;
  children: ComponentChildren;
};

export function PositionHandCard({
  idx,
  numCards,
  isDeal,
  waitFor,
  card,
  children,
  errRef,
  shouldDrop,
  onDrop,
  containerDimensions,
  cardWidth,
  resizeSymbol,
}: PositionHandCardProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const handPosRef = useRef([0, 0, 1]);
  const dragPosRef = useRef([0, 0]);

  const [state, setState] = useState<"idle" | "playing">("idle");

  // Hand positioning
  useLayoutEffect(
    function positionInHand() {
      const $el = elRef.current!;
      const $card = $el.firstChild as HTMLElement;
      const [containerWidth, containerHeight] = containerDimensions;
      handPosRef.current = getHandCardPosition(
        idx,
        numCards,
        cardWidth,
        containerWidth,
        containerHeight
      );
      const [x, y, z] = handPosRef.current;
      if (isDeal) {
        style($el, {
          x,
          y: y + 100,
          rotate: randomBetween(0, 22),
          zIndex: z,
          scale: 1,
        });
        waitFor(style($el, { x, y, rotate: 0, zIndex: z }, { duration: 750 }));
      } else {
        style($el, { x, y, zIndex: z, scale: 1 });
      }
    },
    [resizeSymbol, numCards, card, isDeal]
  );

  // Triggers action when is "played"
  useLayoutEffect(
    function onStateChange() {
      if (state === "playing")
        onDrop(
          elRef.current!,
          card,
          numCards,
          handPosRef.current,
          dragPosRef.current
        );
    },
    [state]
  );

  // Reverts card on error
  useLayoutEffect(
    function onErr() {
      const relevantError = errRef && state === "playing";
      if (!relevantError) return;
      const $el = elRef.current!;
      const [x, y, z] = handPosRef.current;

      style(
        $el,
        { x, y, rotate: [360, 0], zIndex: z, scale: 1 },
        { duration: 300 }
      );
      setState("idle");
    },
    [errRef]
  );

  // Drag handlers
  const bind = useDrag(({ down, movement }) => {
    const $el = elRef.current!;
    dragPosRef.current = movement;

    const [x, y] = handPosRef.current;
    const [mx, my] = dragPosRef.current;

    if (down) {
      style($el, { x: x + mx, y: y + my });
      return;
    }

    if (shouldDrop(mx, my)) {
      setState("playing");
    } else {
      style($el, { x, y }, { duration: 300 });
    }
  });

  return (
    <div
      ref={elRef}
      style={{
        position: "absolute",
        cursor: "pointer",
        touchAction: "none",
      }}
      {...bind()}
    >
      {children}
    </div>
  );
}

export default PositionHandCard;
