import { rotateIndex } from "@lib/array";
import { MiniCard } from "@shared/components/Card";
import { PlayerNumber } from "@shared/components/PlayerBadge";
import { Twemoji } from "@shared/components/Twemoji";
import { useRef } from "preact/hooks";
import { ScoreTable } from "./ScoreTable";
import { bundle, ClientGame } from "~src/bundle";

const {
  client: { useGame, useClient },
} = bundle;

export function Aside() {
  const mode = useClient((x) => x.mode);
  if (mode !== "game") return null;

  return (
    <div
      class="flex flex-col bg-[#005c09] h-full text-white gap-4 p-6 overflow-y-auto "
      style={{ borderLeft: "2px solid rgba(0,0,0,0.1)" }}
    >
      <div class="flex flex-col items-center gap-2">
        <h3>Last trick</h3>
        <LastTrick />
      </div>
      <div class="flex flex-col items-center gap-2">
        <h3>Scores</h3>
        <ScoreTable />
      </div>
    </div>
  );
}

function lastTrickSelector({ board }: ClientGame) {
  const { phase, trick, trickLeader, trickWinner } = board;
  if (phase === "trickWon") {
    return { trick, trickLeader, trickWinner };
  }
  if (phase === "roundStart") return false;
  return true;
}

function LastTrick() {
  const val = useGame(lastTrickSelector);
  const ref = useRef<null | MiniTrickCardProps>(null);

  if (val === false) {
    ref.current = null;
  } else if (val !== true) {
    ref.current = val as MiniTrickCardProps;
  }

  if (ref.current) {
    return <MiniTrickCards {...ref.current} />;
  }

  return <div class="animate-pulse">Waiting for play...</div>;
}

type MiniTrickCardProps = {
  trick: string[];
  trickLeader: number;
  trickWinner: number;
};

function MiniTrickCards({
  trick,
  trickLeader,
  trickWinner,
}: MiniTrickCardProps) {
  return (
    <div class="inline-flex gap-1">
      {trick.map((card, playerIndex) => {
        playerIndex = rotateIndex(trick.length, playerIndex, trickLeader);

        return (
          <MiniTrickCard
            card={card}
            playerIndex={playerIndex}
            winner={playerIndex === trickWinner}
          />
        );
      })}
    </div>
  );
}

function MiniTrickCard({
  card,
  playerIndex,
  winner,
}: {
  card: string;
  playerIndex: number;
  winner?: boolean;
}) {
  return (
    <div class="inline-flex flex-col items-center rounded gap-1">
      <div class="rounded">
        <MiniCard card={card} />
      </div>
      <div class="inline-flex items-center gap-1">
        <div class="inline-block">
          <PlayerNumber playerIndex={playerIndex} />
        </div>
        {winner && <Twemoji char={"🏆"} size={14} />}
      </div>
    </div>
  );
}
