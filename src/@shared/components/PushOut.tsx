import { ComponentChild } from "preact";

export type Dir = "top" | "bottom" | "left" | "right";
export function getProjectionStyle(dir: Dir, padding = 0 as string | number) {
  padding = typeof padding === "string" ? padding : `${padding}px`;
  if (dir === "top")
    return {
      top: "0",
      left: "50%",
      translate: `-50%  calc(-100% - ${padding})`,
    };
  if (dir === "bottom")
    return {
      bottom: "0",
      left: "50%",
      translate: `-50%  calc(100% + ${padding})`,
    };
  if (dir === "left")
    return {
      left: "0",
      top: "50%",
      translate: `calc(-100% - ${padding}) -50%`,
    };
  if (dir === "right")
    return {
      right: "0",
      top: "50%",
      translate: `calc(100% + ${padding}) -50%`,
    };
}

export function PushOut({
  dir,
  padding = 0,
  children,
}: {
  dir: string;
  padding?: number;
  children: ComponentChild;
}) {
  return (
    <div class="absolute" style={getProjectionStyle(dir as Dir, padding)}>
      {children}
    </div>
  );
}

export default PushOut;
