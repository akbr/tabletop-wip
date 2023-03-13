import { bundle } from "./bundle";

import { Title } from "@lib/tabletop/solid-js/components/Title";
import { Lobby } from "@lib/tabletop/solid-js/components/Lobby";
import { App } from "./App";
import { initViews } from "@lib/tabletop/solid-js/initViews";

const dispose = initViews(bundle, {
  Title: () => <Title bundle={bundle} />,
  Lobby: () => <Lobby bundle={bundle} />,
  Game: App,
});

document.body.appendChild(bundle.dom.$root);
