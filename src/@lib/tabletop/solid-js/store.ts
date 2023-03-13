import { Spec, Client, ClientState } from "@lib/tabletop";
import { createRoot } from "solid-js";
import { createStore, reconcile, Store } from "solid-js/store";

export type ClientStore<S extends Spec> = {
  store: Store<ClientState<S>>;
  dispose: () => void;
};

export function createClientStore<S extends Spec>(
  client: Client<S>
): ClientStore<S> {
  return createRoot((solidDispose) => {
    const [store, set] = createStore(client.emitter.get());

    const unsubscribe = client.emitter.subscribe((state) => {
      set(reconcile(state));
    });

    const dispose = () => {
      unsubscribe();
      solidDispose();
    };

    return { store, dispose };
  });
}
