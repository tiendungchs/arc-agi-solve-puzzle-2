import type { DIGIT } from "../const";


export const boundaryFill = (x: number, y: number, targetColor: DIGIT, replacementColor: DIGIT, rect: Array<Array<DIGIT>>) => {
  // Implement boundary fill algorithm
  const fill = (x: number, y: number) => {
    if (x < 0 || x >= rect[0].length || y < 0 || y >= rect.length) return;
    if (rect[x][y] !== targetColor) return;
    rect[x][y] = replacementColor;
    fill(x + 1, y);
    fill(x - 1, y);
    fill(x, y + 1);
    fill(x, y - 1);
  };
  fill(x, y);
}