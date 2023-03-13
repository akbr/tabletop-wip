import { useEmitter } from "@lib/emitter";
import { DialogOf } from "./DialogOf";
import { Spec } from "../../core";
import { AppProps } from "../types";

export function DialogFeeder<S extends Spec>(props: AppProps<S>) {
  const { dialogEmitter, setDialog } = props;
  const Dialog = useEmitter(dialogEmitter);

  if (!Dialog) return null;

  return (
    <DialogOf close={() => setDialog(null)}>
      <Dialog {...props} />
    </DialogOf>
  );
}

export default DialogFeeder;
