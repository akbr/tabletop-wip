import { ComponentChildren } from "preact";

const notchTransform = { transform: "translate(-50%, -50%) rotate(45deg)" };
const notchPositions = {
  right: {
    left: "0",
    top: "50%",
  },
  left: {
    left: "100%",
    top: "50%",
  },
  bottom: {
    left: "50%",
    top: "0",
  },
  top: {
    left: "50%",
    top: "100%",
  },
};
const getNotchStyle = (dir: keyof typeof notchPositions) => ({
  ...notchPositions[dir],
  ...notchTransform,
});

export const SpeechBubble = ({
  dir,
  children,
}: {
  dir: string;
  children: ComponentChildren;
}) => {
  return (
    <div class="m-[8px] relative">
      <div
        class="absolute w-[8px] h-[8px] bg-yellow-200"
        style={getNotchStyle(dir as any)}
      />
      <div class={`bg-yellow-200 text-black p-1.5 rounded`}>{children}</div>
    </div>
  );
};
