import { createClient, createServer, Game, Spec } from "@lib/tabletop";
import { createBundle } from "@lib/tabletop/solid-js/";
import { wizardGame } from "./wizard/game";

function b<S extends Spec>(game: Game<S>) {
  const server = createServer(game);
  const client = createClient(server, game);
  const bundle = createBundle(client);
  return bundle;
}

export const bundle = b(wizardGame);
export default bundle;
