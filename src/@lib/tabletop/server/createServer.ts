import { Game, Spec } from "../core";
import {
  ServerActions,
  ServerApi,
  ServerSocket,
  SocketMeta,
  ServerOutputData,
  Room,
} from "./types";

import { createGameStore } from "../core/store";
import { createBotSocket } from "./createBotSocket";
import { createGameHost } from "./createGameHost";
import { encodeHistory, getRandomRoomID, getSeatNumber } from "./utils";
import avatars from "./avatars";
import { randomFromArray } from "@lib/random";

export function createServer<S extends Spec>(game: Game<S>) {
  // State
  const roomMap = new Map<string, Room<S>>();
  const botMap = new Set<ServerSocket<S>>();
  const socketMap = {
    room: new Map<ServerSocket<S>, { id: string; hasUpdate: boolean }>(),
    meta: new Map<ServerSocket<S>, SocketMeta>(),
  };

  // Dispatch (ensures all socket messages have a loc)
  function dispatch(
    socket: ServerSocket<S>,
    data = {} as Partial<ServerOutputData<S>>
  ) {
    const loc = getLoc(socket);
    if (!loc) {
      socket.send({ loc, err: data.err });
      return;
    }
    socket.send({ loc, ...data });
  }

  // Server API (central routing)
  const serverApi: ServerApi<S> = {
    onopen: (socket) => {
      dispatch(socket);
    },
    onclose: (socket) => {
      onLeave(socket);
    },
    onmessage: (socket, { to, msg }) => {
      if (to === "server") {
        if (msg.type === "setMeta") {
          onSetMeta(socket, msg.data);
          return;
        }

        if (msg.type === "join") {
          onLeave(socket);
          const serverErr = onJoin(socket, msg.data?.id, msg.data?.playerIndex);
          if (serverErr)
            dispatch(socket, { err: { type: "serverErr", msg: serverErr } });
          return;
        }

        if (msg.type === "leave") {
          onLeave(socket);
          return;
        }

        if (msg.type === "addBot") {
          const serverErr = onAddBot(socket, serverApi);
          if (serverErr)
            dispatch(socket, { err: { type: "serverErr", msg: serverErr } });
          return;
        }

        if (msg.type === "start") {
          let serverErr = onStart(socket, msg.data);
          if (serverErr)
            dispatch(socket, { err: { type: "serverErr", msg: serverErr } });
          return;
        }

        dispatch(socket, {
          err: { type: "serverErr", msg: "Invalid server action type." },
        });

        return;
      }

      if (to === "game") {
        const serverErr = onSubmit(socket, msg);
        if (serverErr)
          dispatch(socket, {
            err: { type: "serverErr", msg: "Invalid server action type." },
          });
        return;
      }

      dispatch(socket, {
        err: { type: "serverErr", msg: "Invalid top-level action type." },
      });
    },
  };

  // Gets
  function getRoom(key?: ServerSocket<S> | string) {
    if (!key) return;
    if (typeof key === "string") return roomMap.get(key);
    let roomInfo = socketMap.room.get(key);
    if (roomInfo) return roomMap.get(roomInfo.id);
  }

  function getLoc(socket: ServerSocket<S>) {
    const room = getRoom(socket);
    if (!room) return null;
    return {
      id: room.id,
      playerIndex: room.sockets.indexOf(socket),
      started: Boolean(room.host),
    };
  }

  function getSocketsStatus(room: Room<S>) {
    return room.sockets.map((socket) =>
      socket ? socketMap.meta.get(socket) || {} : { avatar: "🚫" }
    );
  }

  // Sets
  function setMeta(socket: ServerSocket<S>, meta: SocketMeta) {
    const metaUpdate = socketMap.meta.get(socket) || {};
    socketMap.meta.set(socket, { ...meta, ...metaUpdate });
  }

  function createRoom(requestId?: string) {
    const id = requestId || getRandomRoomID();
    roomMap.set(id, {
      id,
      sockets: [],
    });
    return roomMap.get(id)!;
  }

  // Utils
  function broadcastSocketsUpdate(room: Room<S>) {
    room.sockets.forEach(
      (socket) =>
        socket && dispatch(socket, { socketsStatus: getSocketsStatus(room) })
    );
  }

  function clearSocket(socket: ServerSocket<S>) {
    socketMap.room.delete(socket);
    botMap.delete(socket);
    dispatch(socket);
  }

  // Compound
  function onSetMeta(socket: ServerSocket<S>, meta: SocketMeta) {
    setMeta(socket, meta);
    const room = getRoom(socket);
    if (room) broadcastSocketsUpdate(room);
  }

  function onJoin(
    socket: ServerSocket<S>,
    id?: string,
    requestedSeat?: number
  ) {
    const room = getRoom(id) || createRoom(id);

    const seatIndex = getSeatNumber(
      room.sockets,
      game.meta.players,
      requestedSeat
    );

    if (typeof seatIndex === "string") return seatIndex;

    room.sockets[seatIndex] = socket;
    socketMap.room.set(socket, { id: room.id, hasUpdate: false });

    if (!botMap.has(socket)) {
      socketMap.meta.set(socket, { avatar: randomFromArray(avatars) });
    }

    if (room.host) room.host.update(seatIndex);

    broadcastSocketsUpdate(room);
  }

  function onAddBot(socket: ServerSocket<S>, server: ServerApi<S>) {
    if (!game.botFn) {
      return "Game has no botFn.";
    }

    const room = getRoom(socket);
    if (!room) {
      return "Socket not in a room";
    }

    const botSocket = createBotSocket(game.botFn, server);
    botMap.add(botSocket);
    socketMap.meta.set(botSocket, { avatar: "🤖", name: "BOT" });

    const err = onJoin(botSocket, room.id);

    if (err) {
      botMap.delete(botSocket);
      return err;
    }
  }

  function onStart(
    socket: ServerSocket<S>,
    startOptions?: Extract<ServerActions<S>, { type: "start" }>["data"]
  ) {
    const room = getRoom(socket);
    if (!room) return "You're not in a room!";

    if (room.sockets.indexOf(socket) !== 0)
      return "You must be the first player to start the game.";

    const numPlayers = room.sockets.length;
    const { seed, options } = startOptions || {};

    const ctx = {
      numPlayers,
      options: game.getOptions(numPlayers, options),
      seed,
    };

    const store = createGameStore(game, ctx);
    if (typeof store === "string")
      return `Game error when starting game: ${store}`;

    room.store = store;
    room.host = createGameHost(room.store, {
      onUpdate: (playerIndex, update) => {
        const socket = room.sockets[playerIndex];
        if (!socket) return;

        if (botMap.has(socket)) {
          dispatch(socket, { update });
          return;
        }

        const historyString = update.final
          ? encodeHistory(room.store!.getHistory())
          : undefined;

        if (socketMap.room.get(socket)?.hasUpdate) {
          const { ctx, prevBoard, ...hotUpdate } = update;
          dispatch(socket, { hotUpdate, historyString });
          return;
        }

        socketMap.room.get(socket)!.hasUpdate = true;
        dispatch(socket, { update, historyString });
      },
      onErr: (playerIndex, gameErr) => {
        const socket = room.sockets[playerIndex];
        socket && dispatch(socket, { err: { type: "gameErr", msg: gameErr } });
      },
    });

    room.host.update();
  }

  function onSubmit(socket: ServerSocket<S>, action: S["actions"]) {
    const room = getRoom(socket);

    if (!room) return "You are not in a room.";
    if (!room.host) return "This room's game has not started.";

    const playerIndex = room.sockets.indexOf(socket);
    room.host.submit({ playerIndex, action });
  }

  function getHistoryString(socket: ServerSocket<S>) {
    const room = getRoom(socket);
    if (!room) return "You are not in a room.";
    if (!room.store) return "This room's game has not started.";
    const historyString = encodeHistory(room.store.getHistory());
    dispatch(socket, { historyString });
  }

  function onLeave(socket: ServerSocket<S>) {
    const room = getRoom(socket);
    if (!room) return clearSocket(socket);

    const seatIndex = room.sockets.indexOf(socket);
    room.sockets[seatIndex] = null;

    clearSocket(socket);

    const numHumansLeft = room.sockets.filter(
      (s) => s && !botMap.has(s)
    ).length;

    if (numHumansLeft === 0) {
      room.sockets.forEach((socket) => socket && clearSocket(socket));
      roomMap.delete(room.id);
    } else {
      broadcastSocketsUpdate(room);
    }
  }

  return serverApi;
}

export const actionKeys = {
  setMeta: null,
  join: null,
  leave: null,
  addBot: null,
  start: null,
  getHistoryString: null,
};

export default createServer;
