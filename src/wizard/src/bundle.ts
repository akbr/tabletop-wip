import { createPreactBundle } from "@lib/tabletop/preact/createPreactBundle";
import { wizardGame } from "../game/game";

export const isDev = () =>
  location.hostname === "localhost" && location.port === "3000";

export const bundle = createPreactBundle(wizardGame, document.body, {
  dev: isDev(),
});

export type ClientState = ReturnType<typeof bundle.client.emitter.get>;
export type ClientGame = Extract<ClientState, { mode: "game" }>;
