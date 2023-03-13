import "@shared/base.css";

import { getHistoryResults, History } from "@lib/tabletop/core/store";
import { wizardGame } from "../game/game";
import { decodeHistory } from "@lib/tabletop/server/utils";
import { WizardSpec } from "../game/spec";
import { render } from "preact";
import { MiniCard } from "@shared/components/Card";
import { Twemoji } from "@shared/components/Twemoji";

import { rotateArray, rotateIndex } from "@lib/array";

import { FunctionalComponent } from "preact";

const input = window.location.hash.slice(1);
const json = decodeHistory(input) as History<WizardSpec>;

function App() {
  return (
    <div class="inline-flex flex-col gap-2 items-center w-full h-full bg-green-800 p-2">
      <div>{JSON.stringify(json)}</div>
    </div>
  );
}

export const Field: FunctionalComponent<{ legend: string }> = ({
  legend,
  children,
}) => {
  return (
    <fieldset class="inline p-3 border-0 bg-black bg-opacity-25 rounded">
      <legend class="font-bold">{legend}</legend>
      {children}
    </fieldset>
  );
};

function AtAGlance() {
  return (
    <Field legend="Card Distribution">
      <div>Cards dealt (per player): 95</div>
      <Field legend="Wilds"></Field>
      {/**      <Field legend="Wizards">
        <div>Expected: 3.21</div>
        <div>
          <Name name={"0"} player={0} />: 2 (
          <span class="text-red-700">-2.25</span>)
        </div>
        <div>
          <Name name={"1"} player={1} />: 2 (
          <span class="text-green-700">+3.1</span>)
        </div>
      </Field> */}
      <Field legend="Jesters"></Field>
      <Field legend="Trump">
        <div class="text-xs">numCards, totalValue, avgValue</div>
      </Field>
    </Field>
  );
}

function Play() {
  return (
    <Field legend="Play">
      <Field legend="Bids"></Field>
      <Field legend="Accuracy"></Field>
    </Field>
  );
}

function Scores() {
  return <Field legend="Scores"></Field>;
}

function App2() {
  return (
    <div class="inline-flex flex-col gap-2 items-center w-full h-full bg-green-800 p-2">
      <div>
        <u>Date played:</u> {new Date(Date.now()).toString()}
      </div>
      <div>
        <u>Seed:</u> {Date.now() + "-" + Math.random()}
      </div>
      <AtAGlance />
      <Play />
      <Scores />
      <Field legend="Round 1">
        <div class="inline-flex gap-5 flex-wrap justify-center">
          <Field legend="Trick 1-1">
            <Trick
              cards={["2|h", "2|h", "2|h", "2|h", "2|h"]}
              leadPlayer={3}
              trickWinner={4}
            />
          </Field>
        </div>
      </Field>
      <Field legend="Round 10">
        <div class="flex gap-5 flex-wrap justify-center">
          <Field legend="Trick 1-1">
            <Trick
              cards={["2|h", "2|h", "2|h", "2|h", "2|h"]}
              leadPlayer={3}
              trickWinner={4}
            />
          </Field>{" "}
          <Field legend="Trick 1-1">
            <Trick
              cards={["2|h", "2|h", "2|h", "2|h", "2|h"]}
              leadPlayer={3}
              trickWinner={4}
            />
          </Field>{" "}
          <Field legend="Trick 1-1">
            <Trick
              cards={["2|h", "2|h", "2|h", "2|h", "2|h"]}
              leadPlayer={3}
              trickWinner={4}
            />
          </Field>{" "}
          <Field legend="Trick 1-1">
            <Trick
              cards={["2|h", "2|h", "2|h", "2|h", "2|h"]}
              leadPlayer={3}
              trickWinner={4}
            />
          </Field>{" "}
          <Field legend="Trick 1-1">
            <Trick
              cards={["2|h", "2|h", "2|h", "2|h", "2|h"]}
              leadPlayer={3}
              trickWinner={4}
            />
          </Field>{" "}
          <Field legend="Trick 1-1">
            <Trick
              cards={["2|h", "2|h", "2|h", "2|h", "2|h"]}
              leadPlayer={3}
              trickWinner={4}
            />
          </Field>{" "}
          <Field legend="Trick 1-1">
            <Trick
              cards={["2|h", "2|h", "2|h", "2|h", "2|h"]}
              leadPlayer={3}
              trickWinner={4}
            />
          </Field>{" "}
          <Field legend="Trick 1-1">
            <Trick
              cards={["2|h", "2|h", "2|h", "2|h", "2|h"]}
              leadPlayer={3}
              trickWinner={4}
            />
          </Field>{" "}
          <Field legend="Trick 1-1">
            <Trick
              cards={["2|h", "2|h", "2|h", "2|h", "2|h"]}
              leadPlayer={3}
              trickWinner={4}
            />
          </Field>{" "}
          <Field legend="Trick 1-1">
            <Trick
              cards={["2|h", "2|h", "2|h", "2|h", "2|h"]}
              leadPlayer={3}
              trickWinner={4}
            />
          </Field>
        </div>
      </Field>
    </div>
  );
}

function Trick({
  cards,
  leadPlayer,
  trickWinner,
}: {
  cards: string[];
  leadPlayer: number;
  trickWinner: number;
}) {
  return (
    <div class="flex gap-1">
      {rotateArray(cards, -leadPlayer).map((card, idx) => {
        return (
          <TrickCard
            card={card}
            player={rotateIndex(cards.length, idx, leadPlayer)}
          />
        );
      })}
    </div>
  );
}

function TrickCard({ card, player }: { card: string; player: number }) {
  return (
    <div class="flex flex-col justify-center gap-2">
      <MiniCard card={card} />
      <div class="text-center">
        {/**
        <Name name={String(player)} player={player} /> */}
      </div>
    </div>
  );
}

render(<App />, document.body);

/**
 * 
 * 

//@ts-ignore
const results = getHistoryResults(wizardGame, json);
if (typeof results === "string") throw new Error();

//@ts-ignore
//document.body.textContent = JSON.stringify({ ...history, ...results });

let blar = results.boardSets
  .flat()
  .filter((x) => x.phase === "trickWon" || x.phase === "roundStart")
  .map((x) => (x.phase === "roundStart" ? `Round ${x.round}` : x.trick));

function App() {
  return (
    <div>
      {blar.map((x, i) => {
        if (typeof x === "string") {
          return (
            <div class="text-black font-extrabold">
              <br />
              {x}
            </div>
          );
        }
        return (
          <div>
            <div class="text-black">Trick {i}</div>
            {x.map((x) => (
              <MiniCard card={x} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

render(<App />, document.body);

 */
