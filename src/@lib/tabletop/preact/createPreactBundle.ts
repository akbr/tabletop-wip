import { createServer, createClient, Spec, Game } from "..";
import { initViews } from "./initViews";
import { createClientHooks } from "./createClientHooks";
import { attachHashListener } from "../client/plugins";

export function createPreactBundle<S extends Spec>(
  game: Game<S>,
  $el: HTMLElement,
  options: { dev: boolean }
) {
  const { dev } = options;

  const server = dev
    ? createServer(game)
    : location.origin.replace(/^http/, "ws") + location.pathname;

  const client = createClient(server, game);
  client.gameMeter.toggleHistory(dev);
  attachHashListener(client);

  const view = initViews(client, $el, options);

  return {
    server,
    client: {
      ...client,
      ...createClientHooks(client),
    },
    view,
  };
}

export default createPreactBundle;
