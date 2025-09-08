import type { DIGIT } from "../const"
import type { Position } from "./position"

export type ResizeStep = {
  action: 'resize',
  matrixIndex: number, // 1 to 4
  options: {
    size: { width: number, height: number },
  },
  newOutput: [Array<Array<DIGIT>>],
}

export type RotateStep = {
  action: 'rotate',
  matrixIndex: number, // 1 to 4
  options: {
    position: Position,
    size: { width: number, height: number },
    //direction: 'clockwise' | 'counterclockwise' // always clockwise for now
  },
  newOutput: [Array<Array<DIGIT>>],
}

export type FlipStep = {
  action: 'flip',
  matrixIndex: number, // 1 to 4
  options: {
    position: Position,
    size: { width: number, height: number },
    direction: 'horizontal' | 'vertical'
  },
  newOutput: [Array<Array<DIGIT>>],
}

export type ProjectStep = {
  action: 'project' | 'project-force',
  matrixIndex: number, // 1 to 4
  options: {
    position: Position,
    size: { width: number, height: number },
    direction: 'up' | 'down' | 'left' | 'right'
  },
  newOutput: [Array<Array<DIGIT>>],
}

export type CopyStep = {
  action: 'copy',
  options: {
    from: {
      source: 'input' | 'output',
      matrixIndex: number,
      position: Position,
      size: { width: number, height: number },
    },
    to: {
      matrixIndex: number, // 1 to 4
      position: Position
    }
  },
  newOutput: [Array<Array<DIGIT>>],
}

export type ClearStep = {
  action: 'clear',
  matrixIndex: number, // 1 to 4
  options: {
    size: { width: number, height: number },
  },
  newOutput: [Array<Array<DIGIT>>],
}

export type FillStep = {
  action: 'fill',
  matrixIndex: number, // 1 to 4
  options: {
    position: Position,
    size?: { width: number, height: number },
    color: DIGIT
  },
  newOutput: [Array<Array<DIGIT>>],
}

export type Step = ResizeStep | CopyStep | ClearStep | FillStep | RotateStep | FlipStep | ProjectStep;