import type { ComponentChildren, FunctionalComponent } from "preact";
import type { Emitter } from "@lib/emitter";
import type { Spec } from "../core";
import type { Client } from "../client";

export type AppProps<S extends Spec> = {
  client: Client<S>;
  dialogEmitter: DialogEmittet<S>;
  setDialog: SetDialog<S>;
};

export type DialogView<S extends Spec> = FunctionalComponent<AppProps<S>>;
export type DialogEmittet<S extends Spec> = Emitter<DialogView<S> | null>;
export type SetDialog<S extends Spec> = (val: DialogView<S> | null) => void;

export type OptionsView<S extends Spec> = FunctionalComponent<{
  numPlayers: number;
  options: S["options"];
  setOptions: (x: S["options"]) => void;
}>;

export type ViewInputs<S extends Spec> = {
  Backdrop?: FunctionalComponent<AppProps<S> & { children: ComponentChildren }>;
  TitleDisplay: FunctionalComponent<{ title: string }>;
  FooterDisplay: FunctionalComponent<{ title: string }>;
  OptionsView?: OptionsView<S>;
  Game: FunctionalComponent<AppProps<S>>;
  Aside?: FunctionalComponent<AppProps<S>>;
  buttonClass: string;
  showAsideWidth?: number;
};

export type MetaViewProps<S extends Spec> = {
  appProps: AppProps<S>;
  viewInputs: ViewInputs<S>;
};
