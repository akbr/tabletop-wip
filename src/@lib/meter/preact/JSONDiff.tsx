export function KeyValueCompare({
  entryKey,
  prev,
  curr,
}: {
  entryKey: string;
  prev: any;
  curr: any;
}) {
  const areDiff = prev !== curr;
  const backgroundColor = areDiff ? "lightblue" : "";
  return (
    <span style={{ backgroundColor }}>
      {entryKey}: {JSON.stringify(curr)}
    </span>
  );
}

export function JSONDiff({
  prev,
  curr,
}: {
  prev: Record<string, any>;
  curr: Record<string, any>;
}) {
  const entries = Object.entries(curr);
  return (
    <div>
      <span>{"{"}</span>
      {entries.map(([key, currValue], idx, arr) => (
        <>
          <KeyValueCompare entryKey={key} curr={currValue} prev={prev[key]} />
          {idx !== arr.length - 1 && <span>, </span>}
        </>
      ))}
      <span>{"}"}</span>
    </div>
  );
}

export default JSONDiff;
