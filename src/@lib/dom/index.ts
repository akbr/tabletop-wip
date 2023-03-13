export function getElDimensionsVector($el: Element): number[] {
  const rect = $el.getBoundingClientRect();
  return [rect.width, rect.height];
}

export function getNearestDimensions($el: Element): number[] {
  const vec = getElDimensionsVector($el.parentElement!);
  if (vec[0] > 0 && vec[1] > 0) return vec;
  if ($el.parentElement) return getNearestDimensions($el.parentElement);
  return vec;
}
