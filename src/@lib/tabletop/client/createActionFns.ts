import { Game, Spec } from "../core";

export type ActionFns<A extends { type: string; data?: any }> = {
  [T in A as T["type"]]: undefined extends T["data"]
    ? (data?: T["data"]) => boolean
    : (data: T["data"]) => boolean;
};

export function createGameActionFns<S extends Spec>(
  game: Game<S>,
  socket: { send: Function }
) {
  const actions: Record<string, any> = {};
  Object.keys(game.actionKeys).forEach((type) => {
    actions[type] = (data: any) => {
      const action = {
        type,
        data,
      };
      socket.send({ to: "game", msg: action });
      return true;
    };
  });
  return actions;
}

export function createServerActionFns(
  actionKeys: Record<string, any>,
  socket: { send: Function }
) {
  const actions: Record<string, any> = {};
  Object.keys(actionKeys).forEach((type) => {
    actions[type] = (data: any) => {
      socket.send({ to: "server", msg: { type, data } });
      return true;
    };
  });
  return actions;
}
