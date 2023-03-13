import { Twemoji } from "@shared/components/Twemoji";
import { OptionsDisplay } from "./Options";

import { bundle } from "~src/bundle";
const {
  view: { setDialog },
  client: {
    useGame,
    serverActions: { leave, getHistoryString },
  },
} = bundle;

export function OptionsDialog() {
  const [id, ctx, playerIndex] = useGame((x) => [x.id, x.ctx, x.playerIndex]);

  return (
    <div class="flex flex-col  gap-3">
      <div class="flex flex-col gap-2">
        <div>
          <span class="font-bold">Room:</span> {id}
        </div>
        <div>
          <span class="font-bold">Player:</span> {playerIndex}
        </div>
        <div class="flex flex-col max-w-xs gap-0.5">
          <div class="font-bold">Ruleset</div>
          <div class="text-sm pl-2">
            <OptionsDisplay options={ctx.options} />
          </div>
        </div>
      </div>
      <div class="flex flex-col items-center gap-2">
        <button
          onClick={() => {
            leave();
            setDialog(null);
          }}
        >
          <Twemoji char={"🛑"} size={24} /> &nbsp; Leave game
        </button>
        <button
          onClick={() => {
            getHistoryString();
          }}
        >
          <Twemoji char={"🔄"} size={24} /> &nbsp; Generate history
        </button>
      </div>
    </div>
  );
}
