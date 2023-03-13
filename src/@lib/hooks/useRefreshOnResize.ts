import { useState, useEffect } from "preact/hooks";
import { debounce } from "@lib/async";

export function useRefreshOnResize(debounceMs = 250) {
  const [_, set] = useState(Symbol());
  useEffect(() => {
    const update = debounce(() => set(Symbol()), debounceMs, false);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return _;
}
export default useRefreshOnResize;
