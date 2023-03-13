import { useState, useLayoutEffect } from "preact/hooks";

import { useEmitter } from "@lib/emitter";

import { Spec } from "../../core/spec";
import { AppProps } from "../types";

export function Notifications<S extends Spec>(props: AppProps<S>) {
  const err = useEmitter(
    props.client.emitter,
    (x) => x.err,
    (x, y) => x === y
  );
  const connected = useEmitter(props.client.emitter, (x) => x.connected);

  return (
    <section id="tabletop-notifications" class="absolute bottom-2 left-2 z-50">
      <ErrorReciever err={err} />
      <ConnectionWarning connected={connected} />
    </section>
  );
}

export default Notifications;

function ConnectionWarning({ connected }: { connected: boolean }) {
  if (connected) return null;

  return (
    <div class="inline-block bg-yellow-600 p-2 rounded-lg text-white">
      WebSocket not connected.
      <button onClick={() => location.reload()}>Reload 🔄</button>
    </div>
  );
}

function ErrorReciever({ err }: { err: { type: string; msg: string } | null }) {
  const [errs, setErr] = useState<
    {
      type: string;
      msg: string;
    }[]
  >([]);

  useLayoutEffect(() => {
    if (!err) return;
    setTimeout(() => {
      setErr((errs) => errs.filter((x) => x !== err));
    }, 2500);
    setErr((errs) => [...errs, err]);
  }, [err]);

  if (errs.length === 0) return null;

  return (
    <div class="flex flex-col gap-4">
      {errs.map((err) => (
        <div class="inline-block bg-red-600 p-2 rounded-lg text-white">
          {err.type}: {err.msg}
        </div>
      ))}
    </div>
  );
}
