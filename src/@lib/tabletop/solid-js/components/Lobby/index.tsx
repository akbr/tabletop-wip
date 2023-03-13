import type { Spec } from "@lib/tabletop/core/spec";

import { PlayerBadge, BadgeOutline } from "@shared/components/PlayerBadge";
import { Field } from "@shared/components/Field";
import { Twemoji } from "@shared/components/Twemoji";

import { Bundle } from "../../";
import { createEffect, createSignal, Index, onCleanup, Show } from "solid-js";

export function Lobby<S extends Spec>({ bundle }: { bundle: Bundle<S> }) {
  const { game } = bundle;
  const { name } = game.meta;
  // TK: Abstract as a wrapper for Title and Lobby views
  // The extra "margin 0" wrapper is safely center flexbox so overflows on small
  // screens correctly. See: https://stackoverflow.com/a/47636238/
  return (
    <div class="h-full flex flex-col items-center overflow-auto p-4 gap-4">
      <h1>{name}</h1>
      <div style={{ margin: "auto 0" }}>
        <LobbyInnards bundle={bundle} />
      </div>
      <div>Footer</div>
    </div>
  );
}
export default Lobby;

export function LobbyInnards<S extends Spec>({
  bundle,
}: {
  bundle: Bundle<S>;
}) {
  const { store, actions } = bundle;

  const isAdmin = store.playerIndex === 0;

  return (
    <section
      id="tabletop-lobbyContent"
      class="flex flex-col items-center gap-4"
    >
      <RoomDisplay bundle={bundle} />
      <Field legend={`Players`}>
        <PlayersDisplay bundle={bundle} />
      </Field>
      {isAdmin && (
        <Field legend="Host controls">
          <HostDisplay bundle={bundle} />
        </Field>
      )}
      {!isAdmin && (
        <div class="text-center animate-pulse">
          The host will start the game soon!
        </div>
      )}
      <div class="p-4">
        <button
          class={`flex items-center gap-2`}
          onClick={() => actions.server.leave()}
        >
          <Twemoji char={"🛑"} size={24} />
          <span>Leave game</span>
        </button>
      </div>
    </section>
  );
}

export const getRoomURL = (roomId = "") => {
  const host = window.location.hostname.replace("www.", "");
  const port = location.port === "" ? "" : `:${location.port}`;
  const path = window.location.pathname;
  const hash = `#${roomId}`;

  return [host, port, path, hash].join("");
};

function RoomDisplay<S extends Spec>({ bundle }: { bundle: Bundle<S> }) {
  const { store } = bundle;
  const roomId = store.id;

  const [status, setStatus] = createSignal("📋");

  function doCopy() {
    navigator.clipboard.writeText(getRoomURL(roomId)).then(() => {
      setStatus("✅");
    });
  }

  createEffect(() => {
    if (status() === "✅") {
      const tid = setTimeout(() => {
        setStatus("📋");
      }, 1500);
      onCleanup(() => {
        clearInterval(tid);
      });
    }
  });

  return (
    <div class="flex flex-col items-center gap-3">
      <h3 class="inline-flex items-center gap-1">
        Room code:
        <div class="bg-yellow-200 text-black p-1 rounded">{roomId}</div>
      </h3>
      <button class={`flex items-center gap-2`} onClick={doCopy}>
        <Twemoji char={status()} size={24} />
        <span>Copy link</span>
      </button>
    </div>
  );
}

function PlayersDisplay<S extends Spec>({ bundle }: { bundle: Bundle<S> }) {
  const { store, game } = bundle;

  const socketSpaces = Array.from(
    { length: game.meta.players[1] },
    (x) => null
  );

  const badges = socketSpaces.map((_, idx) => {
    return (
      <div class="flex flex-col gap-1 p-2 animate-fadeIn text-center rounded">
        <Show
          when={store.socketsStatus[idx]}
          fallback={<BadgeOutline playerIndex={idx} />}
        >
          <PlayerBadge
            avatar={store.socketsStatus[idx]?.avatar}
            playerIndex={idx}
          />
        </Show>
        <Show when={store.playerIndex === idx}>
          <div class="flex justify-center items-center mt-1 gap-1">
            <h3>You</h3>
          </div>
        </Show>
      </div>
    );
  });

  return <div class="flex flex-wrap justify-center items-center">{badges}</div>;
}

function HostDisplay<S extends Spec>({ bundle }: { bundle: Bundle<S> }) {
  const { store, game, actions } = bundle;

  const numPlayers = () => store.socketsStatus.length;
  const gameReady = () => numPlayers() >= game.meta.players[0];
  const roomFull = () =>
    store.socketsStatus.filter((x) => x).length >= game.meta.players[1];

  const options = game.getOptions(numPlayers());

  /**
  const updateOptions = (nextOptions: S["options"]) =>
    setOptions(game.getOptions(numPlayers, nextOptions));

  useEffect(() => {
    setOptions(game.getOptions(numPlayers, options));
  }, [numPlayers]);
 */

  return (
    <div class="flex flex-col gap-4">
      {/**      {OptionsView && (
        <OptionsView
          numPlayers={numPlayers}
          options={options}
          setOptions={updateOptions}
        />
      )} */}
      <div class="inline-flex flex-col items-center gap-3">
        {game.botFn && (
          <button
            class={`flex items-center gap-2`}
            onClick={() => {
              actions.server.addBot();
            }}
          >
            <Twemoji char={"🤖"} size={24} />
            <span>Add bot</span>
          </button>
        )}
        <button
          class={`flex items-center gap-2`}
          onClick={() => {
            actions.server.start({ options });
          }}
          disabled={!gameReady()}
        >
          <Twemoji char={"➡️"} size={24} />
          <span>Start game</span>
        </button>
      </div>
    </div>
  );
}
