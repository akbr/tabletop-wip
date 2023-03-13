import { ComponentChildren } from "preact";

import { Twemoji } from "@shared/components/Twemoji";
import { MiniCard, splitCard } from "@shared/components/Card";

import { getTotalBids } from "~src/game/logic";
import { bundle, ClientGame } from "~src/bundle";

const {
  client: { useGame },
} = bundle;

export const Hud = () => {
  return (
    <section id="hud" class="absolute top-0 right-0 ">
      <AnimateIn>
        <div class="flex flex-col gap-2 items-end p-2 bg-black bg-opacity-20 rounded-bl-md rounded-br-md animate-fadeIn text-right">
          <RoundDisplay />
          <TrumpDisplay />
          <BidDisplay />
        </div>
      </AnimateIn>
    </section>
  );
};

function RoundDisplay() {
  const round = useGame((x) => x.board.round);

  return (
    <AnimateIn>
      <div>Round: {round}</div>
    </AnimateIn>
  );
}

const trumpDisplayProps = ({ board }: ClientGame) => {
  const b = board;
  return {
    showTrumpDisplay: Boolean(
      b.phase !== "roundStart" &&
        b.phase !== "deal" &&
        b.phase !== "trumpReveal"
    ),
    showWaiting: b.phase === "select",
    trumpCard: b.trumpCard,
    trumpSuit: b.trumpSuit,
  };
};

function TrumpDisplay() {
  const { showTrumpDisplay, showWaiting, trumpCard, trumpSuit } =
    useGame(trumpDisplayProps);

  if (!showTrumpDisplay) return null;

  const vdom = (() => {
    if (showWaiting) return <Twemoji char="⌛" size={16} />;

    if (!trumpSuit) return <Twemoji char="❌" size={16} />;

    let card = trumpCard || `${0}|${trumpSuit}`;
    const { suit } = splitCard(card);
    const showValue = !!trumpCard && !["w", "j"].includes(suit);

    if (!showValue) card = `${0}|${trumpSuit}`;

    return (
      <div class="inline align-middle">
        <MiniCard card={card} showValue={showValue} />
      </div>
    );
  })();

  return (
    <AnimateIn>
      <div class="flex justify-center items-center gap-1">
        <div>Trump: </div>
        <div class="inline">{vdom}</div>
      </div>
    </AnimateIn>
  );
}

function BidDisplay() {
  const [bids, round] = useGame((x) => [x.board.bids, x.board.round]);

  const showBidDisplay = !bids.includes(null);
  if (!showBidDisplay) return null;

  const total = getTotalBids(bids);
  const diff = round - total;
  const sign = diff > 0 ? "-" : "+";
  const str = diff !== 0 ? `${sign + Math.abs(diff)}` : "=";

  return (
    <AnimateIn>
      <div class="flex flex-row items-center gap-1">
        <span>Bids:</span> <span>{str}</span>
      </div>
    </AnimateIn>
  );
}

function AnimateIn({ children }: { children: ComponentChildren }) {
  return <div class="animate-fadeIn">{children}</div>;
}
