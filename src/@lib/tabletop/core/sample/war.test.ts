import { expect, test } from "vitest";

import { createGameStore } from "../store";
import { applyPatches } from "../utils";
import { warGame } from "./war.game";

test("fails on invalid number of players", () => {
  const errPlayers = createGameStore(warGame, {
    numPlayers: 1,
  });
  expect(errPlayers).to.toBeTypeOf("string");
});

test("creates with default options", () => {
  const host = createGameStore(warGame, {
    numPlayers: 2,
    seed: "test_",
  });

  expect(host).to.toBeTypeOf("object");
  if (typeof host !== "object") return;

  const { prevBoard, patches, final } = host.get();
  const boards = applyPatches(prevBoard, patches);

  expect(boards.length).toBe(2);
  expect(boards[0].phase).toBe("deal");
  expect(boards[1].phase).toBe("play");
  expect(final).toBe(false);

  expect(host.submit({ type: "play", data: 2 }, 1)).toBe("Not your turn!");

  expect(host.submit({ type: "play", data: 222 }, 0)).toBe(
    "You don't have that number!"
  );

  expect(host.submit({ type: "play", data: 3 }, 0)).toBe(undefined);

  expect(host.submit({ type: "play", data: 2 }, 0)).toBe("Not your turn!");

  expect(host.submit({ type: "play", data: 222 }, 1)).toBe(
    "You don't have that number!"
  );

  expect(host.submit({ type: "play", data: 3 }, 1)).toBe(undefined);

  expect(host.get().final).toBe(true);
});
