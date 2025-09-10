import { zip } from "lodash";
import type { DIGIT } from "../const";

export const compareValue = (sourceArray: Array<Array<Array<DIGIT>>> | null, targetArray: Array<Array<Array<DIGIT>>> | []) => {
  for (const [source, target] of zip(sourceArray, targetArray)) {
    if (!source || !target || source.length !== target.length) return false;

    for (let i = 0; i < source.length; i++) {
      if (source[i].length !== target[i].length) return false;

      for (let j = 0; j < source[i].length; j++) {
        if (source[i][j] !== target[i][j]) return false;
      }
    }
  }

  return true;
};
