import { ComponentChildren, toChildArray } from "preact";
import { rotateArray } from "@lib/array";
import { getSeatRatio, getStyle } from "@shared/domEffects/positionSeats";

export const PositionSeats = ({
  children,
  perspective,
  padding = 12,
}: {
  children: ComponentChildren;
  perspective: number;
  padding?: number;
}) => {
  const childArray = rotateArray(toChildArray(children), -perspective);
  const numSeats = childArray.length;

  return (
    <>
      {childArray.map((child, index) => {
        const ratio = getSeatRatio(numSeats, index);
        return (
          <div class="absolute" style={{ ...getStyle(ratio), padding }}>
            {child}
          </div>
        );
      })}
    </>
  );
};
export default PositionSeats;
