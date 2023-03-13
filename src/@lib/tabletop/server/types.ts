import type { Socket, SocketServer } from "@lib/socket";
import type { Spec } from "../core/spec";
import type { GameStore, StoreUpdate } from "../core/store";
import { GameHost } from "./createGameHost";

export type Loc = {
  id: string;
  playerIndex: number;
  started: boolean;
};

export type SocketMeta = { avatar?: string; name?: string };
export type SocketsStatus = (SocketMeta | null)[];

export type Room<S extends Spec> = {
  id: string;
  sockets: (ServerSocket<S> | null)[];
  host?: GameHost<S>;
  store?: GameStore<S>;
};

export type ServerActions<S extends Spec> =
  | {
      type: "setMeta";
      data: SocketMeta;
    }
  | {
      type: "join";
      data?: { id: string; playerIndex?: number };
    }
  | { type: "leave" }
  | { type: "addBot" }
  | { type: "start"; data?: { options?: S["options"]; seed?: string } };

export type ServerInputs<S extends Spec> =
  | { to: "game"; msg: S["actions"] }
  | { to: "server"; msg: ServerActions<S> };

export type Err = { type: "serverErr" | "gameErr"; msg: string };

export type ServerOutputData<S extends Spec> = {
  socketsStatus?: SocketsStatus;
  update?: StoreUpdate<S>;
  hotUpdate?: Omit<StoreUpdate<S>, "prevBoard" | "ctx">;
  err?: Err;
  historyString?: string;
};

export type ServerOutputs<S extends Spec> =
  | { loc: null; err?: Err }
  | ({
      loc: Loc;
    } & ServerOutputData<S>);

export type ServerApi<S extends Spec> = SocketServer<
  ServerOutputs<S>,
  ServerInputs<S>
>;

export type ServerSocket<S extends Spec> = Socket<
  ServerOutputs<S>,
  ServerInputs<S>
>;

export type ClientSocket<S extends Spec> = Socket<
  ServerInputs<S>,
  ServerOutputs<S>
>;
