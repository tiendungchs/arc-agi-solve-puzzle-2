import type { DIGIT } from "../const";

export const compareValue = (source: Array<Array<Array<DIGIT>>> | null, target: Array<Array<Array<DIGIT>>> | null) => {
  if (!source || !target || source.length !== target.length) return false;

  for (let i = 0; i < source.length; i++) {
    if (source[i].length !== target[i].length) return false;

    for (let j = 0; j < source[i].length; j++) {
      if (source[i][j].length !== target[i][j].length) return false;
      for (let k = 0; k < source[i][j].length; k++) {
        if (source[i][j][k] !== target[i][j][k]) return false;
      }
    }
  }

  return true;
};
