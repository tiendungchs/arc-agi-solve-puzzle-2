import type { DIGIT } from "../const";

export const projectRectForce = (rect: Array<Array<DIGIT>>, direction: 'up' | 'down' | 'left' | 'right'): Array<Array<DIGIT>> => {
  const rows = rect.length;
  const cols = rect[0].length;

  if (direction === 'up') {
    for (let j = 0; j < cols; j++) {
      let replacementColor = rect[rows - 1][j];
      for (let i = rows - 2; i >= 0; i--) {
        rect[i][j] = replacementColor;
      }
    }
  }
  else if (direction === 'down') {
    for (let j = 0; j < cols; j++) {
      let replacementColor = rect[0][j];
      for (let i = 1; i < rows; i++) {
        rect[i][j] = replacementColor;
      }
    }
  }
  else if (direction === 'left') {
    for (let i = 0; i < rows; i++) {
      let replacementColor = rect[i][cols - 1];
      for (let j = cols - 2; j >= 0; j--) {
        rect[i][j] = replacementColor;
      }
    }
  }
  else if (direction === 'right') {
    for (let i = 0; i < rows; i++) {
      let replacementColor = rect[i][0];
      for (let j = 1; j < cols; j++) {
        rect[i][j] = replacementColor;
      }
    }
  }

  return rect;
}