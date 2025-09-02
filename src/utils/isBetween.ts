import type { Position } from "../types/position";

export const isBetweenPosition = (a: Position, b: Position, c: Position) => {
  return ((a.x <= c.x && c.x <= b.x) || (b.x <= c.x && c.x <= a.x)) &&
         ((a.y <= c.y && c.y <= b.y) || (b.y <= c.y && c.y <= a.y));
};