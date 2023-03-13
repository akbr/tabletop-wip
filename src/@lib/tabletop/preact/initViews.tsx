import { render } from "preact";
import { DevWrapper } from "@lib/meter/preact";
import { createEmitter, useEmitter } from "@lib/emitter";

import type { Spec } from "../core";
import type { Client } from "../client";
import type { AppProps, DialogView, SetDialog } from "./types";

import { ViewInputs } from "./types";
import { createUseResizeObserver } from "./hooks/createUseResizeObserver";

import { StateDisplay } from "./views/StateDisplay";
import { Backdrop } from "./views/Backdrop";
import { Title } from "./views/Title";
import { Lobby } from "./views/Lobby";

import { getElDimensions } from "./hooks/createUseResizeObserver";

import { Notifications } from "./views/Notifications";
import { DialogFeeder } from "./views/DialogFeeder";

export function initViews<S extends Spec>(
  client: Client<S>,
  $el: HTMLElement,
  options: { dev: boolean }
) {
  $el.innerHTML = "";

  // Dom scaffolding (outside the react update structure)
  // ------------------------------------------------------
  render(
    <section id="tabletop-root" class="h-full flex">
      <section id="tabletop-dev" class="h-full" />
      <section id="tabletop-app" class="relative h-full flex flex-grow">
        <section id="tabletop-notifications" class="absolute h-full w-full" />
        <section id="tabletop-game" class="relative h-full flex-grow" />
        <section id="tabletop-aside" class="relative h-full" />
      </section>
    </section>,
    $el
  );

  const dom = {
    $root: document.getElementById("tabletop-root")!,
    $dev: document.getElementById("tabletop-dev")!,
    $app: document.getElementById("tabletop-app")!,
    $game: document.getElementById("tabletop-game")!,
    $aside: document.getElementById("tabletop-aside")!,
    $notifications: document.getElementById("tabletop-notifications")!,
  };

  const getAppDimensions = () => getElDimensions(dom.$app);
  const useAppDimensions = createUseResizeObserver(dom.$app);
  const getGameDimensions = () => getElDimensions(dom.$game);
  const useGameDimensions = createUseResizeObserver(dom.$game);

  // ------------------------------------------------------

  const dialogEmitter = createEmitter<DialogView<S> | null>(null);
  const setDialog: SetDialog<S> = (Dialog) => {
    //@ts-ignore
    dialogEmitter.next(Dialog ? () => Dialog : null);
  };

  const appProps: AppProps<S> = {
    client,
    dialogEmitter,
    setDialog,
  };

  function internalRender(viewInputs: ViewInputs<S>) {
    const rootProps = { appProps, viewInputs };

    if (options.dev) {
      render(
        <DevWrapper meter={client.gameMeter} stateDisplay={StateDisplay} />,
        dom.$dev
      );
    }

    render(
      <>
        <Notifications {...appProps} />
        <DialogFeeder {...appProps} />
      </>,
      dom.$notifications
    );

    if (viewInputs.Aside) {
      const Aside = viewInputs.Aside;
      function ToggleAside() {
        const [width] = useAppDimensions();
        return width > (viewInputs.showAsideWidth || 1000) ? (
          <Aside {...appProps} />
        ) : null;
      }

      render(<ToggleAside />, dom.$aside);
    }

    function App() {
      const mode = useEmitter(appProps.client.emitter, (x) => x.mode);

      const Game = viewInputs.Game;

      const ModeView = (() => {
        if (mode === "title") return <Title {...rootProps} />;
        if (mode === "lobby") return <Lobby {...rootProps} />;
        if (mode === "game") return <Game {...appProps} />;
      })();

      return <Backdrop>{ModeView}</Backdrop>;
    }

    render(<App />, dom.$game);
  }

  return {
    dialogEmitter,
    setDialog,
    getGameDimensions,
    getAppDimensions,
    useAppDimensions,
    useGameDimensions,
    render: internalRender,
    dom,
  };
}

export default initViews;
