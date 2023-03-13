export const JSONPair = ({
  oKey,
  value,
  equal,
}: {
  oKey: string;
  value: any;
  equal: boolean;
}) => {
  return (
    <div class="font-mono">
      <div
        class={
          (equal ? "" : "bg-yellow-300 text-black p-[2px]") + " inline-block"
        }
      >
        {oKey}: {typeof value === "object" ? JSON.stringify(value) : value}
      </div>
    </div>
  );
};

export const alphabetizeKeys = <T extends Record<string, any>>(obj: T): T => {
  const keys = Object.keys(obj).sort() as (keyof T)[];
  const next = {} as T;
  keys.forEach((key) => {
    next[key] = obj[key];
  });
  return next;
};

export const JSONDiff = ({
  curr,
  prev,
}: {
  curr: Record<string, any>;
  prev: Record<string, any>;
}) => {
  const aCurr = alphabetizeKeys(curr);
  return (
    <>
      {Object.entries(aCurr).map(([oKey, value]) => (
        <JSONPair
          oKey={oKey}
          value={value}
          equal={!prev || curr[oKey] === prev[oKey]}
        />
      ))}
    </>
  );
};
