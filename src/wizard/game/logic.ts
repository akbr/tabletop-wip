import type { WizardSpec } from "./spec";
import { shuffle, deal, indexOfMax } from "@lib/array";
import { createPRNG } from "@lib/random/prng";

const SEPERATOR = "|";
export const createCard = (value: number, suit: string) =>
  [value, suit].join(SEPERATOR);
export const createCards = (suits: string[], values: number[]): string[] =>
  suits.map((suit) => values.map((value) => createCard(value, suit))).flat(1);
export const getTuple = (card: string): [number, string] => {
  let [value, suit] = card.split(SEPERATOR);
  return [parseInt(value, 10), suit];
};
export const getValue = (card: string) => getTuple(card)[0];
export const getSuit = (card: string) => getTuple(card)[1];

const createDeck = () => [
  ...createCards(
    ["c", "d", "h", "s"],
    [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
  ),
  ...createCards(["w", "j"], [1, 2, 3, 4]),
];

const suitOrder = ["j", "c", "d", "h", "s", "w"];
const getSortValue = (card: string, trumpSuit?: string | null) => {
  const [value, suit] = getTuple(card);
  const bonus = suit === trumpSuit ? 1000 : suit === "w" ? 9999 : 0;
  return value + suitOrder.indexOf(suit) * 100 + bonus;
};
const sortHand = (hand: string[], trumpSuit?: string | null) => {
  trumpSuit = trumpSuit === "j" ? null : trumpSuit; // Don't sort jesters as trump
  return hand.sort(
    (a, b) => getSortValue(a, trumpSuit) - getSortValue(b, trumpSuit)
  );
};

export const getDeal = (
  numPlayers: number,
  numCards: number,
  seed?: string
) => {
  const deck = shuffle(createDeck(), createPRNG(seed));
  const handSpecs = Array.from({ length: numPlayers }, () => numCards);
  const [unsortedHands, remainingDeck] = deal(deck, handSpecs);

  const trumpCard = remainingDeck.length > 0 ? remainingDeck.pop()! : null;
  const trumpSuit = trumpCard ? getSuit(trumpCard) : null;
  const hands = unsortedHands.map((hand) => sortHand(hand, trumpSuit));

  return {
    hands,
    trumpCard,
    trumpSuit,
  };
};

const getLeadSuit = (trick: string[]) =>
  trick.map(getSuit).find((suit) => suit !== "j");

const winnerWithinSuit = (trick: string[], suit: string) => {
  const adjustedValues = trick.map((card) =>
    getSuit(card) === suit ? getValue(card) : -1
  );
  return indexOfMax(adjustedValues);
};
export const getWinningIndex = (trick: string[], trumpSuit: string | null) => {
  const suits = trick.map(getSuit);

  // First wizard wins
  const firstWizardIndex = suits.indexOf("w");
  if (firstWizardIndex !== -1) return firstWizardIndex;

  // Highest trump wins
  const wildSuits = ["w", "j"];
  const trumpSuitPlayed =
    trumpSuit && !wildSuits.includes(trumpSuit) && suits.includes(trumpSuit);
  if (trumpSuitPlayed) return winnerWithinSuit(trick, trumpSuit);

  // Highest of led suit wins
  const leadSuit = getLeadSuit(trick);
  if (leadSuit && leadSuit !== "w") return winnerWithinSuit(trick, leadSuit);

  // Lead card wins (must be all jesters!)
  return 0;
};

export const getPlayableCards = (hand: string[], trick: string[]) => {
  if (trick.length === 0) return hand;

  const leadSuit = getLeadSuit(trick);
  if (!leadSuit || leadSuit === "w") return hand;

  const handSuits = hand.map(getSuit);
  if (!handSuits.includes(leadSuit)) return hand;

  const playableSuits = new Set([leadSuit, "w", "j"]);
  return hand.filter((_, i) => playableSuits.has(handSuits[i]));
};

export const getScore = (bid: number, actual: number) => {
  const diff = Math.abs(bid - actual);
  return diff === 0 ? 20 + bid * 10 : diff * -10;
};

const toNum = (n: number | null) => (n === null ? 0 : n);
export const getTotalBids = (bids: (number | null)[]) =>
  bids.reduce((a, b) => toNum(a) + toNum(b), 0) as number;

export const _checkBid = (
  bid: number,
  round: number,
  canadian: boolean,
  bids: number,
  isLastBidder: boolean
) => {
  if (bid < 0 || bid > round) {
    return "Invalid bid amount.";
  }

  if (canadian) {
    if (!isLastBidder) return;

    let remainingBids = bids - round;
    if (remainingBids > 0) return;
    if (bid === Math.abs(remainingBids)) {
      return "Bids cannot be even";
    }
  }
};

export const checkBid = (
  bid: number,
  { round, bids, player, dealer }: WizardSpec["board"],
  { canadian }: WizardSpec["options"]
) => _checkBid(bid, round, canadian, getTotalBids(bids), player === dealer);
