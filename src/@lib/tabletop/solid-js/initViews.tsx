import { Component, Match, Switch } from "solid-js";
import { render } from "solid-js/web";

import { Spec } from "@lib/tabletop";
import { Bundle } from "@lib/tabletop/solid-js";

import { DialogWrapper } from "@lib/tabletop/solid-js/components/Dialog";
import { Notifications } from "@lib/tabletop/solid-js/components/Notifications";

type Views = {
  Title: Component;
  Lobby: Component;
  Game: Component;
};

export function initViews<S extends Spec>(bundle: Bundle<S>, views: Views) {
  const { dom, dialog, store } = bundle;

  const Switcher = createSwitcher(store, views);

  const disposes = [
    render(() => <Switcher />, dom.$game),
    render(() => <DialogWrapper dialog={dialog} />, dom.$dialog),
    render(
      () => (
        <div class="absolute bottom-2 left-2 z-50">
          <Notifications msg={store.err} />
        </div>
      ),
      dom.$notifications
    ),
  ];

  return () => {
    disposes.forEach((d) => d());
  };
}

function createSwitcher<S extends Spec>(
  store: Bundle<S>["store"],
  views: Views
): Component {
  const { Title, Lobby, Game } = views;

  return function Switcher() {
    return (
      <Switch>
        <Match when={store.mode === "title"}>
          <Title />
        </Match>
        <Match when={store.mode === "lobby"}>
          <Lobby />
        </Match>
        <Match when={store.mode === "game"}>
          <Game />
        </Match>
      </Switch>
    );
  };
}
