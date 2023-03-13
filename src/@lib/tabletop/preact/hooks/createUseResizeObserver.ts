import { useLayoutEffect, useMemo, useRef, useState } from "preact/hooks";
import { debounce } from "@lib/async";
import { shallow } from "@lib/compare";

export const getElDimensions = ($el: HTMLElement) => {
  const { width, height } = $el.getBoundingClientRect();
  return [width, height];
};

export const createUseResizeObserver = ($el: HTMLElement) => () => {
  const initialValue = useMemo(() => getElDimensions($el), []);

  const [rect, setRect] = useState(initialValue);
  let observer = useRef<ResizeObserver | null>(null);

  useLayoutEffect(() => {
    const update = debounce(
      () => {
        const next = getElDimensions($el);
        if (!shallow(rect, next)) setRect(next);
      },
      200,
      false
    );
    observer.current = new ResizeObserver(update);
    observer.current.observe($el);
    return () => observer.current?.disconnect();
  }, [$el]);

  return rect;
};
