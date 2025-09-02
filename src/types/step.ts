import type { DIGIT } from "../const"
import type { Position } from "./position"

export type ResizeStep = {
  action: 'resize',
  options: {
    size: { width: number, height: number },
  },
  newOutput: Array<Array<DIGIT>>,
}

export type CopyStep = {
  action: 'copy',
  options: {
    from: {
      source: 'input' | 'output',
      position: Position,
      size: { width: number, height: number },
    },
    to: {
      position: Position
    }
  },
  newOutput: Array<Array<DIGIT>>,
}

export type ClearStep = {
  action: 'clear',
  options: {
    size: { width: number, height: number },
  },
  newOutput: Array<Array<DIGIT>>,
}

export type FillStep = {
  action: 'fill',
  options: {
    position: Position,
    size?: { width: number, height: number },
    color: DIGIT
  },
  newOutput: Array<Array<DIGIT>>,
}

export type Step = ResizeStep | CopyStep | ClearStep | FillStep;