const X_PEEK = 35;
const Y_PEEK = 60;

export const getHandHeight = (
  numChildren: number,
  containerWidth: number,
  xPeek = X_PEEK,
  yPeek = Y_PEEK
) => Math.ceil(numChildren / Math.floor(containerWidth / xPeek)) * yPeek;

export const getHandCardPosition = (
  cardIdx: number,
  numCards: number,
  cardWidth = 80,
  containerWidth = window.innerWidth,
  containerHeight = window.innerHeight,
  xPeek = X_PEEK,
  yPeek = Y_PEEK
) => {
  const maxInRow = Math.floor(containerWidth / xPeek);
  const numRows = Math.ceil(numCards / maxInRow);

  const rowIdx = Math.floor(cardIdx / maxInRow);
  const cardIdxInRow = cardIdx % maxInRow;
  const remainingCards = numCards - (cardIdx + 1);
  const numInRow =
    cardIdxInRow + remainingCards >= maxInRow
      ? maxInRow
      : cardIdxInRow + remainingCards + 1;

  const rowWidth = xPeek * numInRow + (cardWidth - xPeek);
  const rowExtraSpace = containerWidth - rowWidth;
  const xBuffer = rowExtraSpace > 0 ? rowExtraSpace / 2 : 0;
  const yBuffer = containerHeight - yPeek;

  const x = cardIdxInRow * xPeek + xBuffer;
  const y = -rowIdx * yPeek + yBuffer;
  const zIndex = numRows - rowIdx;

  return [x, y, zIndex];
};
