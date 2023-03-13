import { createStore, reconcile } from "solid-js/store";
import { For, render } from "solid-js/web";
import { createMeter } from "@lib/meter/meter3";
import { withSelector } from "@lib/emitter";

const meter = createMeter(0);

function clone<T extends Object>(i: T) {
  return structuredClone(i) as T;
}
const [store, set] = createStore(clone(meter.emitter.get()));
meter.emitter.subscribe((state) => set(reconcile(state)));

withSelector(
  meter.emitter,
  (x) => x.states[x.idx],
  (s) => {
    console.log(s);
    meter.waitFor(1000);
  }
);
function App() {
  function getColor() {
    return store.mode === "playing"
      ? "orange"
      : store.mode === "paused"
      ? "red"
      : "green";
  }

  return (
    <div>
      <button onClick={() => meter.setIdx(0)}>{"<<"}</button>
      <button onClick={() => meter.setIdx((x) => x - 1)}>{"<"}</button>
      <button onClick={() => meter.setPlay((x) => !x)}>
        {store.mode === "paused" ? "Play" : "Pause"}
      </button>
      <button onClick={() => meter.setIdx((x) => x + 1)}>{">"}</button>
      <button onClick={() => meter.setIdx((_, l) => l - 1)}>{">>"}</button>
      <div>{store.mode}</div>
      <button
        onClick={() => {
          meter.pushStates(store.states.at(-1)! + 1);
        }}
      >
        Add
      </button>
      <For each={store.states}>
        {(s, i) => {
          return (
            <div
              onClick={() => meter.setIdx(i())}
              style={{
                "background-color": i() !== store.idx ? "" : getColor(),
              }}
            >
              {s}-{store.states[i() - 1]}
            </div>
          );
        }}
      </For>
    </div>
  );
}

render(() => <App />, document.body);

meter.pushStates(1, 2, 3, 4);
