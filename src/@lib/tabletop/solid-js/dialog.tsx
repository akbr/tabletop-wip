import { Component, createSignal } from "solid-js";

export function createDialog() {
  return createSignal<null | Component>(null);
}

export type DialogSignal = ReturnType<typeof createDialog>;
