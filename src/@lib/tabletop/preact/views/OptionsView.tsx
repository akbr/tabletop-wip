import { Spec } from "@lib/tabletop";
import { FunctionComponent } from "preact";

export type OptionsView<S extends Spec> = FunctionComponent<{
  options: S["options"];
  setOptions: (options: S["options"]) => void;
  numPlayers: number;
}>;
