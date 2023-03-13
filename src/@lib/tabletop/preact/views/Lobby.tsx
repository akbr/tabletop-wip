import { useEffect, useState } from "preact/hooks";

import { PlayerBadge, BadgeOutline } from "@shared/components/PlayerBadge";
import { Field } from "@shared/components/Field";
import { Twemoji } from "@shared/components/Twemoji";

import type { Spec } from "../../core";
import { useClientLobby } from "../createClientHooks";
import { MetaViewProps } from "../types";

export function Lobby<S extends Spec>(props: MetaViewProps<S>) {
  const name = props.appProps.client.game.meta.name;
  const { TitleDisplay, FooterDisplay } = props.viewInputs;
  // TK: Abstract as a wrapper for Title and Lobby views
  // The extra "margin 0" wrapper is safely center flexbox so overflows on small
  // screens correctly. See: https://stackoverflow.com/a/47636238/
  return (
    <div class="h-full flex flex-col items-center overflow-auto p-4 gap-4">
      <TitleDisplay title={name} />
      <div style={{ margin: "auto 0" }}>
        <LobbyInnards {...props} />
      </div>
      <FooterDisplay title={name} />
    </div>
  );
}

export function LobbyInnards<S extends Spec>(props: MetaViewProps<S>) {
  const { appProps, viewInputs } = props;
  const { client } = appProps;

  const isAdmin = useClientLobby(client)((x) => x.playerIndex === 0);

  return (
    <section
      id="tabletop-lobbyContent"
      class="flex flex-col items-center gap-4"
    >
      <RoomDisplay {...props} />
      <Field legend={`Players`}>
        <PlayersDisplay {...props} />
      </Field>
      {isAdmin && (
        <Field legend="Host controls">
          <HostDisplay {...props} />
        </Field>
      )}
      {!isAdmin && (
        <div class="text-center animate-pulse">
          The host will start the game soon!
        </div>
      )}
      <div class="p-4">
        <button
          class={`flex items-center gap-2 ${viewInputs.buttonClass}`}
          onClick={() => client.serverActions.leave()}
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

function RoomDisplay<S extends Spec>(props: MetaViewProps<S>) {
  const { client } = props.appProps;
  const { buttonClass } = props.viewInputs;

  const roomId = useClientLobby(client)((x) => x.id);

  const [status, setStatus] = useState("📋");

  useEffect(() => {
    if (status === "✅") {
      setTimeout(() => {
        setStatus("📋");
      }, 1500);
    }
  });

  function doCopy() {
    navigator.clipboard.writeText(getRoomURL(roomId)).then(() => {
      setStatus("✅");
    });
  }

  return (
    <div class="flex flex-col items-center gap-3">
      <h3 class="inline-flex items-center gap-1">
        Room code:
        <div class="bg-yellow-200 text-black p-1 rounded">{roomId}</div>
      </h3>
      <button class={`flex items-center gap-2 ${buttonClass}`} onClick={doCopy}>
        <Twemoji char={status} size={24} />
        <span>Copy link</span>
      </button>
    </div>
  );
}

function PlayersDisplay<S extends Spec>(props: MetaViewProps<S>) {
  const { client } = props.appProps;

  const [playerIndex, socketsStatus] = useClientLobby(client)((x) => [
    x.playerIndex,
    x.socketsStatus,
  ]);

  const modSockets = Array.from(
    { length: client.game.meta.players[1] },
    (x) => null
  );

  return (
    <div class="flex flex-wrap justify-center items-center">
      {modSockets.map((_, idx) => {
        const player = socketsStatus[idx];
        let isPlayer = idx === playerIndex;
        return (
          <div class="flex flex-col gap-1 p-2 animate-fadeIn text-center rounded">
            {player && <PlayerBadge avatar={player.avatar} playerIndex={idx} />}
            {!player && <BadgeOutline playerIndex={idx} />}
            {isPlayer && (
              <div class="flex justify-center items-center mt-1 gap-1">
                <h3>You</h3>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function HostDisplay<S extends Spec>(props: MetaViewProps<S>) {
  const { client } = props.appProps;
  const { buttonClass, OptionsView } = props.viewInputs;

  const socketsStatus = useClientLobby(client)((x) => x.socketsStatus);

  const { game, serverActions } = client;
  const { start } = serverActions;

  const numPlayers = socketsStatus.length;

  const [options, setOptions] = useState(game.getOptions(numPlayers));

  const gameReady = socketsStatus.length >= game.meta.players[0];
  const roomFull =
    socketsStatus.filter((x) => x).length >= game.meta.players[1];
  const updateOptions = (nextOptions: S["options"]) =>
    setOptions(game.getOptions(numPlayers, nextOptions));

  useEffect(() => {
    setOptions(game.getOptions(numPlayers, options));
  }, [numPlayers]);

  return (
    <div class="flex flex-col gap-4">
      {OptionsView && (
        <OptionsView
          numPlayers={numPlayers}
          options={options}
          setOptions={updateOptions}
        />
      )}
      <div class="inline-flex flex-col items-center gap-3">
        {client.game.botFn && (
          <button
            class={`flex items-center gap-2 ${buttonClass}`}
            onClick={() => {
              client.serverActions.addBot();
            }}
            disabled={roomFull}
          >
            <Twemoji char={"🤖"} size={24} />
            <span>Add bot</span>
          </button>
        )}
        <button
          class={`flex items-center gap-2 ${buttonClass}`}
          onClick={() => start({ options })}
          disabled={!gameReady}
        >
          <Twemoji char={"➡️"} size={24} />
          <span>Start game</span>
        </button>
      </div>
    </div>
  );
}
