import { useState } from "preact/hooks";

export function SelectInput({ select }: { select: (trump: string) => void }) {
  const [suit, setSuit] = useState("c");
  const [state, setState] = useState<"in" | "out">("in");

  return (
    <div class="flex flex-col items-center text-center gap-[16px] max-w-[175px] animate-fadeIn">
      <h3>Choose trump:</h3>
      <select
        name="suits"
        style={{ maxWidth: "100px" }}
        onChange={(e: any) => {
          setSuit(e.target.value);
        }}
      >
        <option value="c">Clubs ♣</option>
        <option value="d">Diamonds ♦</option>
        <option value="h">Hearts ♥</option>
        <option value="s">Spades ♠</option>
      </select>
      <button
        disabled={state === "out"}
        onClick={(e) => {
          setState("out");
          setTimeout(() => select(suit), 0);
        }}
      >
        Select
      </button>
    </div>
  );
}
