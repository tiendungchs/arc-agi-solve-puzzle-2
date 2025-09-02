import type { DIGIT } from "../const"

export type TrainingData = {
  [key: string]: {
    train: Array<{
      input: Array<Array<DIGIT>>,
      output: Array<Array<DIGIT>>,
    }>,
    test: [{
      input: Array<Array<DIGIT>>,
    }]
  }
}