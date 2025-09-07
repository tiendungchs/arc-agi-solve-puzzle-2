import type { SelectedCell } from "../types/selectedCell";

export const UNIT = 12;

export type DIGIT = "-1" | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const COLOR_MAP: Record<DIGIT, string> = {
  "-1": "#ffffff",
  0: "#e6194b",
  1: "#3cb44b",
  2: "#ffe119",
  3: "#4363d8",
  4: "#f58231",
  5: "#911eb4",
  6: "#46f0f0",
  7: "#f032e6",
  8: "#bcf60c",
  9: "#fabebe",
};

export const INDEX_MAP: Record<string, DIGIT> = {
    "#ffffff": "-1",
    "#e6194b": 0,
    "#3cb44b": 1,
    "#ffe119": 2,
    "#4363d8": 3,
    "#f58231": 4,
    "#911eb4": 5,
    "#46f0f0": 6,
    "#f032e6": 7,
    "#bcf60c": 8,
    "#fabebe": 9,
}

export const DEFAULT_SOLUTION_MATRIX: Array<Array<DIGIT>> = [
  ["-1", "-1", "-1"],
  ["-1", "-1", "-1"],
  ["-1", "-1", "-1"]
]

export const DEFAULT_SELECTED_CELL: SelectedCell = {
  mode: "edit",
  color: 0 as DIGIT
} 