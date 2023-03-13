import { ComponentChildren } from "preact";

import { PlayerBadge } from "@shared/components/PlayerBadge";
import { Twemoji } from "@shared/components/Twemoji";
import { PushOut } from "@shared/components/PushOut";
import { SpeechBubble } from "@shared/components/SpeechBubble";
import { FadeInOut } from "@shared/components/FadeInOut";

export type SeatProps = {
  avatar?: string;
  playerIndex: number;
  direction: string;
  isDealer: boolean;
  alert?: WizardAlert;
  display?: WizardDisplay;
};

export function Seat({
  avatar,
  playerIndex,
  direction,
  isDealer,
  alert,
  display,
}: SeatProps) {
  const isVertical = ["top", "bottom"].includes(direction);

  const Alert = (
    <AlertSpace direction={direction}>
      {getWizardAlert({ direction, alert })}
    </AlertSpace>
  );

  const BottomDisplay = (
    <BottomDisplaySpace isVertical={isVertical}>
      {getWizardDisplay({ display, isPlayer: direction === "top" })}
    </BottomDisplaySpace>
  );

  return (
    <section
      type="seat"
      class="relative inline-flex flex-col justify-center items-center align-center gap-[2px]"
    >
      <PlayerBadge avatar={avatar} playerIndex={playerIndex}>
        <DealerIndicator isDealer={isDealer} />
        {!isVertical && Alert}
      </PlayerBadge>
      {BottomDisplay}
      {isVertical && Alert}
    </section>
  );
}

export type WizardAlert =
  | { type: "dealBubble" }
  | { type: "trumpBubble" }
  | { type: "bidBubble"; data: number }
  | { type: "scoreBubble"; data: number }
  | { type: "waiting" };

function AlertSpace({
  direction,
  children,
}: {
  direction: string;
  children?: ComponentChildren;
}) {
  return (
    <PushOut dir={direction} padding={direction === "bottom" ? 3 : 6}>
      <FadeInOut>{children}</FadeInOut>
    </PushOut>
  );
}

function getWizardAlert({
  alert,
  direction,
}: {
  alert?: WizardAlert;
  direction: string;
}) {
  if (!alert) return null;

  const { type } = alert;

  if (type === "waiting") {
    return (
      <div class="animate-pulse p-[2px]">
        <Twemoji char={"⌛"} size={24} />
      </div>
    );
  }

  return (
    <SpeechBubble dir={direction}>
      <div class="whitespace-nowrap">
        {type === "dealBubble" && "Dealing..."}
        {type === "trumpBubble" && "Trump is..."}
        {type === "bidBubble" && `Bid: ${alert.data}`}
        {type === "scoreBubble" && <ScoreNumber score={alert.data} />}
      </div>
    </SpeechBubble>
  );
}

function ScoreNumber({ score }: { score: number }) {
  const isPositive = score >= 0;
  const sign = isPositive ? "+" : "";
  const color = isPositive ? "#006400" : "red";
  return (
    <div class="font-bold" style={{ color }}>
      {sign + score}
    </div>
  );
}

function BottomDisplaySpace({
  isVertical,
  children,
}: {
  isVertical: boolean;
  children?: ComponentChildren;
}) {
  const childDisplay = <FadeInOut>{children}</FadeInOut>;

  return isVertical ? (
    childDisplay
  ) : (
    <PushOut dir={"bottom"} padding={5}>
      {childDisplay}
    </PushOut>
  );
}

export type WizardDisplay = { type: "bidProgress"; data: number[] };

function getWizardDisplay({
  display,
  isPlayer,
}: {
  display?: WizardDisplay;
  isPlayer?: boolean;
}) {
  if (!display) return isPlayer ? <div class="select-none">&nbsp;</div> : null;
  const [bid, actual] = display.data;
  return (
    <div>
      {actual}/{bid}
    </div>
  );
}

const DealerDisplay = (
  <div class="absolute top-0 right-0" style={{ translate: "7px -7px" }}>
    <Twemoji char={"✋"} size={20} />
  </div>
);

function DealerIndicator({ isDealer }: { isDealer?: boolean }) {
  return <FadeInOut>{isDealer ? DealerDisplay : null}</FadeInOut>;
}
