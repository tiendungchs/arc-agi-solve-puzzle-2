import type { DIGIT } from "../const"
import type { Position } from "./position"
import type { Size } from "./size"

export type SelectedCell = {
  mode: "edit" | "select" | "fill",
  color: DIGIT,
  position?: Position,
  size?: Size,
  isCopied: boolean
}