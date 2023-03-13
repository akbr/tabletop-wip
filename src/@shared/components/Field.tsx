import { FunctionalComponent } from "preact";

export const Field: FunctionalComponent<{ legend: string }> = ({
  legend,
  children,
}) => {
  return (
    <fieldset class="p-4 border-0 bg-black bg-opacity-20 rounded">
      <legend class="font-bold text-lg">{legend}</legend>
      {children}
    </fieldset>
  );
};

export default Field;
