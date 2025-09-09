import type { SelectedCell } from "../types/selectedCell";

export const UNIT = 12;

export type DIGIT = "-1" | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const COLOR_MAP: Record<DIGIT, string> = {
  "-1": "#ffffff",
  0: "#000000",
  1: "#1E93FF",
  2: "#F93C31",
  3: "#4FCC30",
  4: "#FFDC00",
  5: "#999999",
  6: "#E53AA3",
  7: "#FF851B",
  8: "#87D8F1",
  9: "#921231",
};

export const INDEX_MAP: Record<string, DIGIT> = {
  "#ffffff": "-1",
  "#000000": 0,
  "#1E93FF": 1,
  "#F93C31": 2,
  "#4FCC30": 3,
  "#FFDC00": 4,
  "#999999": 5,
  "#E53AA3": 6,
  "#FF851B": 7,
  "#87D8F1": 8,
  "#921231": 9,
}

export const DEFAULT_SOLUTION_MATRIX: Array<Array<DIGIT>> = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0]
]

export const DEFAULT_SELECTED_CELL: SelectedCell = {
  mode: "edit",
  color: 0 as DIGIT,
  isCopied: false
} 