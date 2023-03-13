import { createEffect } from "solid-js";
import { bundle } from "./bundle";

const { store, meter } = bundle;

export function App() {
  return (
    <div class="inline-flex flex-col gap-2 p-2">
      <div class="bg-slate-600 text-white p-2">
        {JSON.stringify(store.board)}
      </div>
    </div>
  );
}
