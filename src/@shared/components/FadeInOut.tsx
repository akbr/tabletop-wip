import { ComponentChildren, toChildArray } from "preact";
import { useLayoutEffect, useRef, useState } from "preact/hooks";
import { style } from "@lib/style";

const useReRender = function () {
  const [, setState] = useState<Symbol>();
  return () => setState(Symbol());
};

function defaultOnChange($el: HTMLElement, show: boolean) {
  return style($el, { opacity: show ? [0, 1] : [1, 0] }, { duration: 250 });
}

export function FadeInOut({
  children,
  onChange = defaultOnChange,
}: {
  children?: ComponentChildren;
  onChange?: typeof defaultOnChange;
}) {
  const rerender = useReRender();
  const childrenRef = useRef<ComponentChildren>(null);
  const ref = useRef<HTMLDivElement>(null);
  const show = Boolean(children);
  if (children !== null) childrenRef.current = children;

  useLayoutEffect(() => {
    if (!childrenRef.current) return;
    let myChildren = childrenRef.current;

    const $el = ref.current!;
    onChange($el, show)?.finished!.then(() => {
      if (!show && childrenRef.current === myChildren) {
        childrenRef.current = null;
        rerender();
      }
    });
  }, [show]);

  return <div ref={ref}>{childrenRef.current}</div>;
}
