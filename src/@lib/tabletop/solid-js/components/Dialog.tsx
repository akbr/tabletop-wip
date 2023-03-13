import { Component, createMemo } from "solid-js";
import { DialogOf } from "@shared/components/DialogOf";
import { DialogSignal } from "../dialog";

export const DialogWrapper: Component<{ dialog: DialogSignal }> = (props) => {
  const [dialog, set] = props.dialog;
  const close = () => set(null);

  const getDialog = createMemo(() => {
    const Dialog = dialog();
    return Dialog ? <Dialog /> : null;
  });

  return <DialogOf close={close}>{getDialog()}</DialogOf>;
};
