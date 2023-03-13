import { Component, createEffect, createSignal, For } from "solid-js";

export type Msg = { type: string; msg: string; date: number };

export const Notifications: Component<{ msg: Msg | null }> = (props) => {
  const [msgs, setMsg] = createSignal<Msg[]>([]);

  createEffect(() => {
    if (props.msg && props.msg.date) {
      const msg = JSON.parse(JSON.stringify(props.msg!)) as Msg;
      setMsg((m) => [...m, msg!]);
      const date = msg.date;
      setTimeout(() => {
        setMsg((m) => m.filter((x) => x.date !== msg.date));
      }, 2000);
    }
  });

  return (
    <div class="flex flex-col gap-2 z-50 pointer-events-none w-full">
      <For each={msgs()}>
        {(o) => (
          <div class="bg-red-600 p-2 rounded-lg text-white">
            {o.type}: {o.msg}
          </div>
        )}
      </For>
    </div>
  );
};
