import type { DIGIT } from "../const"

export type SelectedCell = {
  mode: "edit" | "select" | "fill",
  color: DIGIT,
  position?: {
    x: number,
    y: number,
    source: 'input' | 'output',
    sx: number,
    sy: number,
    isCopy: boolean
  }
}