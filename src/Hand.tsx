import { JSX, Component, createEffect, onCleanup } from "solid-js";

import { style } from "@lib/style";
import { dragify } from "@lib/dom/dragify";
import { getHandCardPosition } from "./@shared/domEffects/positionHand";

export type HandProps = {
  children: JSX.Element;
  cards: string[];
  initial?: boolean;
  w: number;
  h: number;
};

/**
 * A wrapper component that handles positioning and playing of cards in the player's hand.
 */
export const Hand: Component<HandProps> = (props) => {
  let $hand: HTMLDivElement;

  // Update card positions, tag with data-card.
  createEffect(() => {
    const $cards = Array.from($hand.children) as HTMLElement[];
    initCards(props.cards, $cards, props.w, props.h);
  });

  let $active: HTMLElement | null = null;

  // Event delegation for dragging
  createEffect(() => {
    const unsub = dragify($hand, {
      onDragStart: ($el) => {
        $active = $el.closest("[data-card]") as HTMLElement;
      },
      onDrag: ({ mx, my }) => {
        style($active!, {
          transform: `translate(${mx}px, ${my}px)`,
          scale: 1,
        });
      },
      onDragEnd: () => {
        style(
          $active!,
          { transform: `translate(0px, 0px)`, scale: 1 },
          { duration: 300 }
        );
      },
    });

    onCleanup(() => unsub());
  });

  return (
    <div
      ref={$hand!}
      class="absolute top-0"
      onClick={(e) => {
        const $card = e.target.closest("[data-card]") as HTMLElement;
        const cardId = $card.dataset.card!;
      }}
    >
      {props.children}
    </div>
  );
};

function initCards(
  cards: string[],
  $cards: HTMLElement[],
  w: number,
  h: number
) {
  $cards.forEach(($card, idx) => {
    $card.dataset.card = cards[idx];
    style($card, { position: "absolute" });
    const [x, y, zIndex] = getHandCardPosition(
      idx,
      $cards.length,
      undefined,
      w,
      h
    );
    style(
      $card,
      {
        x,
        y,
        zIndex,
        scale: 1,
      },
      { duration: 350 }
    );
  });
}

export default Hand;
