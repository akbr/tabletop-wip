import { ComponentChildren } from "preact";

export function Backdrop({ children }: { children: ComponentChildren }) {
  return (
    <section
      id="tabletop-backdrop"
      class="relative h-full w-full text-white"
      style={{
        background: "radial-gradient(circle,#00850b 5%,#005c09 50%)",
        text: "white",
      }}
    >
      {children}
    </section>
  );
}

export default Backdrop;
