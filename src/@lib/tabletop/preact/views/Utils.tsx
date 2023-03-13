import { ComponentChildren } from "preact";

export const Field = ({
  legend,
  children,
}: {
  legend: string;
  children: ComponentChildren;
}) => {
  return (
    <fieldset class="p-3 border-0 bg-black bg-opacity-40 rounded">
      <legend class="font-bold">{legend}</legend>
      {children}
    </fieldset>
  );
};

export default Field;
