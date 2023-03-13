import { useRef } from "preact/hooks";
import { shallow } from "@lib/compare";

export function useShallowRef<T extends any>(input: T): T {
  const ref = useRef<T | null>(null);
  if (!shallow(ref.current, input)) ref.current = input;
  return ref.current!;
}
export default useShallowRef;
