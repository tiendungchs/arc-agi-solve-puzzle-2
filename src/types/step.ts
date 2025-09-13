import type { DIGIT } from "../const"
import type { Position } from "./position"
import type { Size } from "./size"

export type ResizeStep = {
  action: 'resize',
  matrixIndex: number, // 1 to 4
  options: {
    size: Size,
  },
  newOutput: Array<Array<Array<DIGIT>>>,
}

export type RotateStep = {
  action: 'rotate',
  options: {
    position: Position,
    size: Size,
    //direction: 'clockwise' | 'counterclockwise' // always clockwise for now
  },
  newOutput: Array<Array<Array<DIGIT>>>,
}

export type FlipStep = {
  action: 'flip',
  options: {
    position: Position,
    size: Size,
    direction: 'horizontal' | 'vertical'
  },
  newOutput: Array<Array<Array<DIGIT>>>,
}

export type ProjectStep = {
  action: 'project' | 'project-force',
  options: {
    position: Position,
    size: Size,
    direction: 'up' | 'down' | 'left' | 'right'
  },
  newOutput: Array<Array<Array<DIGIT>>>,
}

export type MatchStep = {
  action: 'match',
  options: {
    from: {
      position: Position,
      size: Size,
    },
    to: {
      position: Position
    }
  },
  newOutput: Array<Array<Array<DIGIT>>>,
}

export type CopyStep = {
  action: 'copy',
  options: {
    from: {
      position: Position,
      size: Size,
    },
    to: {
      position: Position
    }
  },
  newOutput: Array<Array<Array<DIGIT>>>,
}

export type ClearStep = {
  action: 'clear',
  matrixIndex: number, // 1 to 4
  newOutput: Array<Array<Array<DIGIT>>>,
}

export type FillStep = {
  action: 'fill' | 'fill-boundary',
  options: {
    position: Position,
    size: Size,
    color: DIGIT
  },
  newOutput: Array<Array<Array<DIGIT>>>,
}

export type Step = ResizeStep | CopyStep | ClearStep | FillStep | RotateStep | FlipStep | ProjectStep | MatchStep;