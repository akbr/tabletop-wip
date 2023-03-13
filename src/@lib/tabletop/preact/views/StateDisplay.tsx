import { Spec } from "../../core";
import { JSONDiff } from "@lib/meter/preact";

export function StateDisplay<S extends Spec>({
  curr,
  prev,
}: {
  curr: any;
  prev?: any;
}) {
  return (
    <>
      {curr?.action && (
        <div class="font-bold">{JSON.stringify(curr.action)}</div>
      )}
      {curr?.board && (
        <JSONDiff
          curr={curr.board}
          prev={prev && prev.board ? prev.board : {}}
        />
      )}
    </>
  );
}
