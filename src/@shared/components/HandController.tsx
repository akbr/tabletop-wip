import { ComponentChildren } from "preact";
import { useLayoutEffect, useRef } from "preact/hooks";

import { dragify } from "@lib/dom/simpleDragify";
import style from "@lib/style";

import { getHandCardPosition } from "@shared/domEffects/positionHand";
import { randomBetween } from "@lib/random";

export type HandControllerProps = {
  children: ComponentChildren;
  hand: string[];
  containerDimensions: number[];
  isDeal?: boolean;
  errRef?: any;
  shouldDrop?: typeof defaultShouldDrop;
  onDrop?: typeof defaultOnDrop;
};

export function HandController({
  children,
  hand,
  errRef,
  isDeal,
  containerDimensions,
  shouldDrop = defaultShouldDrop,
  onDrop = defaultOnDrop,
}: HandControllerProps) {
  const ref = useRef<HTMLDivElement>(null);
  let $active = useRef<HTMLElement>();
  let playStatus = useRef(false);

  useLayoutEffect(() => {
    initHandCards(ref.current!, hand);
    positionHandCards(ref.current!, containerDimensions);
  }, [hand, ...containerDimensions]);

  useLayoutEffect(() => {
    if (isDeal) positionHandCards(ref.current!, containerDimensions, true);
  }, [isDeal, ...containerDimensions]);

  useLayoutEffect(() => {
    playStatus.current = false;
  }, [hand, ...containerDimensions]);

  useLayoutEffect(() => {
    return dragify(ref.current!, {
      onDragStart: ($el) => {
        if (playStatus.current) return;
        $active.current = $el.closest("[data-card]") as HTMLElement;
      },
      onDrag: ({ mx, my }) => {
        if (playStatus.current) return;
        const [x, y] = getElHandPosition(
          $active.current!,
          containerDimensions,
          hand
        );
        style($active.current!, { x: x - mx, y: y - my, scale: 1 });
      },
      onDragEnd: ({ mx, my }) => {
        if (playStatus.current) return;

        if (shouldDrop(mx, my)) {
          playStatus.current = true;
          onDrop($active.current!, $active.current!.dataset.card!);
          return;
        }

        const [x, y] = getElHandPosition(
          $active.current!,
          containerDimensions,
          hand
        );
        style($active.current!, { x, y, scale: 1 }, { duration: 300 });
      },
    });
  }, [hand, ...containerDimensions]);

  useLayoutEffect(() => {
    if (!errRef || !$active.current) return;
    const [x, y] = getElHandPosition(
      $active.current!,
      containerDimensions,
      hand
    );
    style(
      $active.current!,
      { x, y, scale: 1, rotate: [360, 0] },
      { duration: 300 }
    );
    $active.current = undefined;
    playStatus.current = false;
  }, [errRef, hand, ...containerDimensions]);

  return (
    <section
      ref={ref}
      data-type={"handController"}
      class="absolute top-0 cursor-pointer touch-none"
    >
      {children}
    </section>
  );
}

function initHandCards($el: HTMLElement, hand: string[]) {
  const $cards = Array.from($el.children) as HTMLElement[];
  $cards.forEach(($card, idx) => {
    $card.style.position = "absolute";
    $card.style.willChange = "transform";
    $card.dataset.card = hand[idx];
  });
}

function positionHandCards(
  $el: HTMLElement,
  containerDimensions: number[],
  deal?: boolean
) {
  const $cards = Array.from($el.children) as HTMLElement[];
  const numCards = $cards.length;
  if (numCards === 0) return;
  const width = parseInt(getComputedStyle($cards[0]).width, 10);

  $cards.forEach(($card, idx) => {
    const [x, y] = getHandCardPosition(
      idx,
      numCards,
      width,
      containerDimensions[0],
      containerDimensions[1]
    );
    if (deal) {
      style($card, { x, y: y + 100, scale: 1 });
      style(
        $card,
        { x, y, rotate: [randomBetween(0, 22), 0], scale: 1 },
        { duration: 500 }
      );
    } else {
      style($card, { x, y, scale: 1 });
    }
  });
}

function getElHandPosition(
  $el: HTMLElement,
  containerDimensions: number[],
  hand: string[]
) {
  return getHandCardPosition(
    hand.indexOf($el.dataset.card!),
    hand.length,
    parseInt(getComputedStyle($el).width, 10),
    containerDimensions[0],
    containerDimensions[1]
  );
}

function defaultShouldDrop(mx: number, my: number) {
  return my > 50;
}

function defaultOnDrop($el: HTMLElement, card: string) {
  style($el, { x: 0, y: 0 }, { duration: 500 });
}
