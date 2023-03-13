import { ComponentChildren } from "preact";
import { rotateArray } from "@lib/array";
import { Twemoji } from "@shared/components/Twemoji";

import { getScore } from "../../game/logic";

import { bundle } from "~src/bundle";
const {
  client: { useGame },
} = bundle;

export const convert = (scores: number[][]) => {
  let rows: number[][][] = [];

  let runningTotal = scores[0].map(() => 0);
  let thisBids: number[];
  let thisActuals: number[];

  scores.forEach((x, idx) => {
    if (idx % 2 === 0) {
      thisBids = x;
      return;
    }

    thisActuals = x;

    let columns = thisBids.map((bid, playerIndex) => {
      let actual = thisActuals[playerIndex];
      let score = getScore(bid, actual);
      runningTotal[playerIndex] += score;
      return [runningTotal[playerIndex], bid, actual];
    });

    rows.push(columns);
  });

  return rows;
};

const PlayerHead = ({ children }: { children: ComponentChildren }) => (
  <th class="p-1" scope={"col"} colSpan={3}>
    <div class="flex items-center justify-center">{children}</div>
  </th>
);

const PlayerCells = ([score, bid, actual]: number[]) => {
  const backgroundColor = bid === actual ? "#90EE90" : "#F08080";
  return (
    <>
      <td style={{ backgroundColor }}>{score}</td>
      <td>{bid}</td>
      <td>{actual}</td>
    </>
  );
};

const PlayerRow = ({ columns }: { columns: number[][] }) => (
  <tr>{columns.map(PlayerCells)}</tr>
);

export const ScoreTable = () => {
  const [playerIndex, socketsStatus, scores] = useGame((x) => [
    x.playerIndex,
    x.socketsStatus,
    x.board.scores,
  ]);

  let modSeats = rotateArray(socketsStatus, -playerIndex);

  return (
    <div class="text-center">
      {/** @ts-ignore  */}
      <table border={"1"} class="bg-white text-black rounded pb-0.5">
        <tr>
          {modSeats.map((player) => {
            const avatar = player?.avatar || "👤";
            return (
              <PlayerHead>
                <Twemoji char={avatar} size={24} />
              </PlayerHead>
            );
          })}
        </tr>
        {scores.length > 0 &&
          convert(scores.map((row) => rotateArray(row, -playerIndex))).map(
            (columns) => <PlayerRow columns={columns} />
          )}
      </table>
    </div>
  );
};
