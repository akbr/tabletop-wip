import { ComponentChildren } from "preact";

export function Container({ children }: { children: ComponentChildren }) {
  return (
    <section
      id="tabletop-container"
      class="flex flex-col gap-12 items-center justify-between h-full p-4 overflow-auto"
    >
      {children}
    </section>
  );
}
export default Container;
