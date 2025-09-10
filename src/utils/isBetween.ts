import type { Position } from "../types/position";

export const isBetweenPosition = (a: Position, b: Position, c: Position) => {
  if (a.source !== b.source || a.source !== c.source) return false;
  if (a.matrixIndex !== b.matrixIndex || a.matrixIndex !== c.matrixIndex) return false;
  // Check if point c is within the bounding box defined by points a and b
  return ((a.x <= c.x && c.x <= b.x) || (b.x <= c.x && c.x <= a.x)) &&
         ((a.y <= c.y && c.y <= b.y) || (b.y <= c.y && c.y <= a.y));
};