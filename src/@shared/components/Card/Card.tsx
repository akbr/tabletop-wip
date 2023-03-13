import { values, suits, colors } from "./glyphs";
export const splitCard = (cardId: string) => {
  const split = cardId.split("|");
  const value = parseInt(split[0], 10) as keyof typeof values;
  const suit = split[1] as keyof typeof suits;
  const color = colors[suit] || "black";
  return { value, suit, color } as const;
};

const filter = "drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.5))";
export const Card = ({ card }: { card: string }) => {
  const { value, suit, color } = splitCard(card);
  const showValue = !["w", "j"].includes(suit);

  return (
    <div
      class="rounded-[8px] bg-[#fffff4]"
      style={{ filter, width: "80px", height: "112px" }}
    >
      <div
        class="flex flex-col pt-[6px] pl-[2px] gap-[4px] w-[26px]"
        style={{ fill: color }}
      >
        {showValue && values[value] && values[value]!()}
        {suits[suit] && suits[suit]!()}
      </div>
      <div
        id="suit"
        class="absolute bottom-[6px] right-[2px] w-[54px]"
        style={{ fill: color }}
      >
        {suits[suit] && suits[suit]!()}
      </div>
    </div>
  );
};
export default Card;

export const MiniCard = ({
  card,
  showValue = true,
  overrideColor = null,
}: {
  card: string;
  showValue?: boolean;
  overrideColor?: string | null;
}) => {
  let { value, suit, color } = splitCard(card);
  color = overrideColor || color;

  return (
    <div class="inline-block">
      <div
        class="bg-[#fffff4] rounded flex justify-center items-center p-[3px]"
        style={{ border: "1px solid black" }}
      >
        {showValue && values[value] && (
          <div class="w-4 h-4" style={{ fill: color }}>
            {values[value]()}
          </div>
        )}
        <div class="w-4 h-4" style={{ fill: color }}>
          {suit && suits[suit]()}
        </div>
      </div>
    </div>
  );
};
