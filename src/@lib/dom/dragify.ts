type MoveProps = {
  mx: number;
  my: number;
  dx: number;
  dy: number;
};

export const dragify = (
  $el: HTMLElement,
  {
    onDrag,
    onDragStart,
    onDragEnd,
  }: {
    onDrag: (props: MoveProps, $el: HTMLElement) => void;
    onDragStart: ($el: HTMLElement) => void;
    onDragEnd: (props: MoveProps, $el: HTMLElement) => void;
  }
) => {
  const listeners = [
    ["mousemove", drag],
    ["touchmove", drag],
    ["mouseup", dragEnd],
    ["mouseleave", dragEnd],
    ["touchend", dragEnd],
  ] as const;

  function toggleListeners(toggle: boolean) {
    listeners.forEach(([type, listener]) =>
      toggle
        ? document.body.addEventListener(type, listener)
        : document.body.removeEventListener(type, listener)
    );
  }

  let startX = 0;
  let startY = 0;
  let prevX = 0;
  let prevY = 0;

  function getInfo(pageX: number, pageY: number): MoveProps {
    const props = {
      mx: -(startX - pageX),
      my: -(startY - pageY),
      dx: prevX - pageX,
      dy: prevY - pageY,
    };

    prevX = pageX;
    prevY = pageY;

    return props;
  }

  function dragStart(e: MouseEvent | TouchEvent) {
    const { pageX, pageY } = "touches" in e ? e.touches[0] : e;
    startX = pageX;
    startY = pageY;
    prevX = pageX;
    prevY = pageY;

    toggleListeners(true);
    onDragStart(e.target as HTMLElement);
  }

  function drag(e: MouseEvent | TouchEvent) {
    const { pageX, pageY } = "touches" in e ? e.touches[0] : e;
    onDrag(getInfo(pageX, pageY), e.target as HTMLElement);
  }

  function dragEnd(e: MouseEvent | TouchEvent) {
    const { pageX, pageY } = "touches" in e ? e.changedTouches[0] : e;
    onDragEnd(getInfo(pageX, pageY), e.target as HTMLElement);
    toggleListeners(false);
  }

  $el.addEventListener("mousedown", dragStart);
  $el.addEventListener("touchstart", dragStart);
  $el.ondragstart = () => false;

  return () => {
    toggleListeners(false);
    $el.removeEventListener("mousedown", dragStart);
    $el.removeEventListener("touchstart", dragStart);
    $el.ondragstart = null;
  };
};
