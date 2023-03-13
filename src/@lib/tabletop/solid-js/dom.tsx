import { debounce } from "@lib/async";
import { createEffect, createRoot, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";

export type DOM = ReturnType<typeof createDOM>;

export function createDOM() {
  const $root = (
    <section id="tabletop-root" class="h-full flex">
      <section id="tabletop-dev" class="h-full" />
      <section id="tabletop-app" class="relative h-full flex flex-grow">
        <section id="tabletop-dialog" class="absolute h-full w-full" />
        <section id="tabletop-notifications" class="absolute h-full w-full" />
        <section id="tabletop-game" class="relative h-full flex-grow" />
        <section id="tabletop-aside" class="relative h-full" />
      </section>
    </section>
  ) as HTMLElement;

  return {
    $root,
    $dev: $root.querySelector("#tabletop-dev") as HTMLElement,
    $app: $root.querySelector("#tabletop-app") as HTMLElement,
    $game: $root.querySelector("#tabletop-game") as HTMLElement,
    $aside: $root.querySelector("#tabletop-aside") as HTMLElement,
    $notifications: $root.querySelector(
      "#tabletop-notifications"
    ) as HTMLElement,
    $dialog: $root.querySelector("#tabletop-dialog") as HTMLElement,
  };
}

export type DimensionsStore = ReturnType<typeof createDimensionsStore>;

export function createDimensionsStore(dom: DOM) {
  function getDimensions($el: HTMLElement) {
    const { width, height } = $el.getBoundingClientRect();
    return [width, height];
  }

  function getUpdate() {
    return { root: getDimensions(dom.$root), game: getDimensions(dom.$game) };
  }

  const [dimensions, set] = createStore({
    ...getUpdate(),
    syncUpdate: function () {
      set(getUpdate());
    },
  });

  function createDimensionsEffect(
    $el: HTMLElement,
    key: keyof typeof dimensions
  ) {
    createEffect(() => {
      const observer = new ResizeObserver(
        debounce(() => {
          set(key, getDimensions($el));
        }, 250)
      );

      observer.observe($el);
      onCleanup(() => {
        observer.disconnect();
      });
    });
  }

  createRoot(() => {
    createDimensionsEffect(dom.$root, "root");
    createDimensionsEffect(dom.$game, "game");
  });

  return dimensions;
}
