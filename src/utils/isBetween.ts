import type { Position } from "../types/position";

export const isBetweenPosition = (a: Position, b: Position, c: Position) => {
  return ((a.x <= c.x && c.x <= b.x && a.z === c.z) || (b.x <= c.x && c.x <= a.x && b.z === c.z)) &&
         ((a.y <= c.y && c.y <= b.y && a.z === c.z) || (b.y <= c.y && c.y <= a.y && b.z === c.z));
};