import { JSX } from "solid-js";
import { Twemoji } from "./Twemoji";

export const colors = [
  ["#e6194B", "white"],
  ["#3cb44b", "white"],
  ["#4363d8", "white"],
  ["#911eb4", "white"],
  ["#f58231", "white"],
  ["#f032e6", "white"],
  ["#42d4f4", "black"],
  ["#bfef45", "black"],
  ["#fabed4", "black"],
  ["#ffe119", "black"],
] as const;

const filter = "drop-shadow(2px 2px 3px rgba(0,0,0,0.3))";
const filter2 = "drop-shadow(0px 0px 2px rgba(0,0,0,0.75))";

export function PlayerBadge(props: {
  avatar?: string;
  playerIndex: number;
  children?: JSX.Element;
}) {
  const backgroundColor = colors[props.playerIndex][0];
  const color = colors[props.playerIndex][1];

  return (
    <div
      class="relative p-2 rounded-lg"
      style={{ "background-color": backgroundColor, filter }}
    >
      <div style={{ filter }}>
        <Twemoji char={props.avatar || "👤"} size={34} />
      </div>
      <div
        class="absolute pt-0.25 pl-1 font-mono font-bold top-0 left-0"
        style={{ color, filter: filter2 }}
      >
        {props.playerIndex + 1}
      </div>
      {props.children && <>{props.children}</>}
    </div>
  );
}

export function PlayerNumber({ playerIndex }: { playerIndex: number }) {
  const backgroundColor = colors[playerIndex][0];
  const color = colors[playerIndex][1];
  return (
    <div
      class="rounded font-mono font-bold pl-0.5 pr-0.5"
      style={{ color, "background-color": backgroundColor }}
    >
      {playerIndex + 1}
    </div>
  );
}

export function BadgeOutline({ playerIndex }: { playerIndex: number }) {
  const backgroundColor = colors[playerIndex][0];
  return (
    <div
      class="rounded w-[50px] h-[50px]"
      style={{ border: `2px ${backgroundColor} dashed`, filter }}
    ></div>
  );
}

export default PlayerBadge;
