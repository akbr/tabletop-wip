import type { Spec } from "@lib/tabletop/core/spec";
import { Bundle } from "../";

import { Twemoji } from "@shared/components/Twemoji";

import { Container } from "./Container";

export function Title<S extends Spec>({ bundle }: { bundle: Bundle<S> }) {
  const { store, actions, game } = bundle;

  function Buttons() {
    return (
      <section
        id="tabletop-titleContent"
        class="flex flex-col justify-center gap-2"
      >
        <button
          onClick={() => actions.server.join()}
          disabled={!store.connected}
        >
          <Twemoji char={"✨"} size={24} />
          &nbsp;
          <span>Create game</span>
        </button>
        <h3 class="font-italic font-light"></h3>
        <button
          onClick={() => {
            const id = prompt("Enter a room code:");
            if (!id) return;
            actions.server.join({ id: id.toUpperCase() });
          }}
          disabled={!store.connected}
        >
          <Twemoji char={"🚪"} size={24} />
          <span>Join game</span>
        </button>
      </section>
    );
  }

  return (
    <Container>
      <h1>{game.meta.name}</h1>
      <Buttons />
      <div>Footer</div>
    </Container>
  );
}
