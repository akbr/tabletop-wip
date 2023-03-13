import { Spec, Client, ClientState } from "@lib/tabletop";
import { Component, createRoot, createSignal } from "solid-js";
import { createStore, reconcile, Store } from "solid-js/store";
import { createDimensionsStore, createDOM, DimensionsStore, DOM } from "./dom";
import { DialogSignal, createDialog } from "./dialog";
import { ClientStore, createClientStore } from "./store";

type DialogState<S extends Spec> = Component<Bundle<S>> | null;

export type Bundle<S extends Spec> = {
  game: Client<S>["game"];
  store: ClientStore<S>["store"];
  emitter: Client<S>["emitter"];
  actions: {
    game: Client<S>["gameActions"];
    server: Client<S>["serverActions"];
  };
  meter: Client<S>["gameMeter"];
  // ---
  dialog: DialogSignal;
  dom: DOM;
  dimensions: DimensionsStore;
};

export function createBundle<S extends Spec>(client: Client<S>): Bundle<S> {
  const dom = createDOM();
  const dimensions = createDimensionsStore(dom);

  const [current, dialogSet] = createSignal<DialogState<S>>(null);
  const set = (arg: DialogState<S>) => {
    if (arg === null) dialogSet(null);
    if (arg) dialogSet(() => arg);
  };

  return {
    game: client.game,
    emitter: client.emitter,
    store: createClientStore(client).store,
    actions: {
      game: client.gameActions,
      server: client.serverActions,
    },
    meter: client.gameMeter,
    dialog: createDialog(),
    dom,
    dimensions,
  };
}

export default createBundle;
