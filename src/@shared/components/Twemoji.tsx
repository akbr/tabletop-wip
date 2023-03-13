const U200D = String.fromCharCode(0x200d);
const UFE0Fg = /\uFE0F/g;

function toCodePoint(unicodeSurrogates: string) {
  var r = [],
    c = 0,
    p = 0,
    i = 0;
  while (i < unicodeSurrogates.length) {
    c = unicodeSurrogates.charCodeAt(i++);
    if (p) {
      r.push((0x10000 + ((p - 0xd800) << 10) + (c - 0xdc00)).toString(16));
      p = 0;
    } else if (0xd800 <= c && c <= 0xdbff) {
      p = c;
    } else {
      r.push(c.toString(16));
    }
  }
  return r.join("-");
}
function getEmojiCode(rawText: string) {
  return toCodePoint(
    rawText.indexOf(U200D) < 0 ? rawText.replace(UFE0Fg, "") : rawText
  );
}
export const getCDNUrl = (emoji: string) =>
  `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${getEmojiCode(
    emoji
  )}.svg`;

export function Twemoji(props: {
  char: string;
  size?: number;
  align?: string;
}) {
  return (
    <img
      class="block"
      src={getCDNUrl(props.char)}
      height={props.size}
      width={props.size}
      alt={props.char}
    ></img>
  );
}
