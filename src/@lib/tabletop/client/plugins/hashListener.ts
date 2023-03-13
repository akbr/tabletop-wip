import { Spec, Client } from "../../";

export function attachHashListener<S extends Spec>(client: Client<S>) {
  function reactToHash() {
    const state = client.emitter.get();

    const hash = getHash();

    if (
      "id" in state &&
      state.id === hash.id &&
      state.playerIndex === hash.player
    )
      return;

    if (hash.id) {
      client.serverActions.join({ id: hash.id, playerIndex: hash.player });
    } else {
      client.serverActions.leave();
    }
  }

  reactToHash();
  window.onhashchange = () => reactToHash();

  const un = client.emitter.subscribe((s) => {
    if (s.mode === "title") {
      replaceHash();
      return;
    }
    const { id, playerIndex } = s;
    replaceHash({ id, player: playerIndex });
  });

  return () => {
    window.onhashchange = () => undefined;
    un();
  };
}

// ---

export type HashStatus = {
  id?: string;
  player?: number;
};

export function getHashString(status?: HashStatus) {
  if (!status) return "#";
  let { id, player } = status;
  return `#${id || ""}${player !== undefined ? `/${player}` : ""}`;
}

export function setHash(status?: HashStatus) {
  window.location.hash = getHashString(status);
}

export function replaceHash(status?: HashStatus) {
  window.history.replaceState(null, "", getHashString(status));
}

export function getHash(): HashStatus {
  let hash = window.location.hash;
  hash = hash.substr(1, hash.length);
  if (hash.length === 0) return {};
  let [id, potentialIndex] = hash.split("/");
  let maybeIndex = parseInt(potentialIndex, 10);
  let player = isNaN(maybeIndex) ? undefined : maybeIndex;
  return { id, player };
}
