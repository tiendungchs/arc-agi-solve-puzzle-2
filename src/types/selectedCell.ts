import type { DIGIT } from "../const"

export type SelectedCell = {
  mode: "edit" | "select" | "fill",
  color: DIGIT,
  position?: {
    z?: number,
    x: number,
    y: number,
    source: 'input' | 'output',
    sx: number,
    sy: number,
  },
  copyPosition?: {
    z?: number,
    x: number,
    y: number,
    source: 'input' | 'output',
    sx: number,
    sy: number,
  }
}