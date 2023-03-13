import { ComponentChildren } from "preact";
import { Twemoji } from "@shared/components/Twemoji";
import { OptionsDialog } from "./Dialogs";
import { ScoreTable } from "./ScoreTable";

import { bundle } from "~src/bundle";
const {
  client: { useGame },
  view: { setDialog },
} = bundle;

export const UiButtons = () => {
  return (
    <section id="uiButtons" class="absolute top-0 left-0">
      <Box>
        <OptionsButton />
        <ScoresButton />
        <AnalyzeButton />
      </Box>
    </section>
  );
};

function Box({ children }: { children: ComponentChildren }) {
  return <div class="flex gap-2 m-3">{children}</div>;
}

function OptionsButton() {
  return (
    <button
      onClick={() => {
        setDialog(OptionsDialog);
      }}
    >
      <Twemoji char={"⚙️"} size={24} />
    </button>
  );
}

function ScoresButton() {
  const scores = useGame((x) => x.board.scores);

  return scores.length <= 0 ? null : (
    <button
      onClick={() => {
        setDialog(ScoreTable);
      }}
    >
      <Twemoji char={"🔢"} size={24} />
    </button>
  );
}

const getAnalyzeHref = (history: string) => {
  const host = window.location.hostname.replace("www.", "");
  const port = location.port === "" ? "" : `:${location.port}`;
  const path = window.location.pathname;
  const hash = `#${history}`;

  return [location.protocol, "//", host, port, path, "analyze.html", hash].join(
    ""
  );
};

function AnalyzeButton() {
  const historyString = useGame((x) => x.historyString);
  if (!historyString) return null;

  return (
    <button class="cursor-pointer">
      <a href={getAnalyzeHref(historyString)} target="_blank">
        <Twemoji char={"📊"} size={24} />
      </a>
    </button>
  );
}
