import { Vec, Vector } from "@lib/vector";
import {
  getSeatPosition,
  getSeatDirectionVector,
  getSeatRatio,
} from "./positionSeats";

function getCardsPerDimension(numPlayers: number) {
  if (numPlayers === 2) return [1, 2];
  if (numPlayers === 3) return [3, 1];
  return [3, 2];
}

export function getTrickScaling(
  numPlayers: number,
  containerDimensions: number[],
  originalCardDimensions: number[],
  playDistanceVec: number[],
  maxScale = 1.2,
  cardPaddingVec = [16, 16]
) {
  const containerDimensionsForScaling = Vec.sub(
    containerDimensions,
    Vec.mul(playDistanceVec, 2),
    cardPaddingVec
  );

  const maxCardDimensions = Vec.divV(
    containerDimensionsForScaling,
    getCardsPerDimension(numPlayers)
  );

  let scale = Math.min(...Vec.divV(maxCardDimensions, originalCardDimensions));

  scale = scale > maxScale ? maxScale : scale;

  return scale;
}

export const getScaleAdjVector = (
  scaledDimensions: Vector,
  atScale: number
) => {
  const originalDimensions = Vec.mul(scaledDimensions, 1 / atScale);
  return Vec.mul(Vec.sub(scaledDimensions, originalDimensions), 0.5);
};

export const getHeldPosition = (
  numPlayers: number,
  seatIndex: number,
  containerDimensions: Vector,
  childDimensions: Vector,
  playDistance = [0, 0] as Vector
) => {
  const scale = getTrickScaling(
    numPlayers,
    containerDimensions,
    childDimensions,
    playDistance
  );

  const scaledDimensions = Vec.mul(childDimensions, scale);

  const [xR, yR] = getSeatRatio(numPlayers, seatIndex);
  const seat = getSeatPosition(numPlayers, seatIndex, containerDimensions);
  const adjDirVector = (() => {
    if (xR === 0) return [-1, -0.5];
    if (xR === 1) return [0, -0.5];
    if (yR === 0) return [-0.5, -1];
    return [-0.5, 0];
  })();
  const posVector = Vec.mulV(scaledDimensions, adjDirVector);

  const pos = Vec.add(
    seat,
    posVector,
    getScaleAdjVector(scaledDimensions, scale)
  );

  return [...pos, scale];
};

export const getCenterPlayedPosition = (
  containerDimensions: Vector,
  cardDimensions: Vector
) => {
  const screenCenter = Vec.mul(containerDimensions, 0.5);
  const cardCenter = Vec.mul(cardDimensions, -0.5);
  return Vec.add(screenCenter, cardCenter);
};

export const getPlayedPosition = (
  numPlayers: number,
  seatIndex: number,
  containerDimensions: Vector,
  cardDimensions: Vector,
  distance = [0, 0] as Vector
) => {
  const heldPosition = getHeldPosition(
    numPlayers,
    seatIndex,
    containerDimensions,
    cardDimensions,
    distance
  );
  const [, , scale] = heldPosition;

  const [cardW, cardH] = Vec.mul(cardDimensions, scale);
  const [dX, dY] = distance;
  const direction = getSeatDirectionVector(numPlayers, seatIndex);
  const pushOut = Vec.mulV([dX + cardW, dY + cardH], direction);
  const pos = Vec.add(heldPosition, pushOut);

  return [...pos, scale];
};
