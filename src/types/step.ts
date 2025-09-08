import type { DIGIT } from "../const"
import type { Position } from "./position"

export type ResizeStep = {
  action: 'resize',
  options: {
    z: number,
    size: { width: number, height: number },
  },
  newOutput: Array<Array<Array<DIGIT>>>,
}

export type RotateStep = {
  action: 'rotate',
  options: {
    position: Position,
    size: { width: number, height: number },
    //direction: 'clockwise' | 'counterclockwise' // always clockwise for now
  },
  newOutput: Array<Array<Array<DIGIT>>>,
}

export type FlipStep = {
  action: 'flip',
  options: {
    position: Position,
    size: { width: number, height: number },
    direction: 'horizontal' | 'vertical'
  },
  newOutput: Array<Array<Array<DIGIT>>>,
}

export type ProjectStep = {
  action: 'project' | 'project-force',
  options: {
    position: Position,
    size: { width: number, height: number },
    direction: 'up' | 'down' | 'left' | 'right'
  },
  newOutput: Array<Array<Array<DIGIT>>>,
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
  newOutput: Array<Array<Array<DIGIT>>>,
}

export type ClearStep = {
  action: 'clear',
  options: {
    z: number,
    size: { width: number, height: number },
  },
  newOutput: Array<Array<Array<DIGIT>>>,
}

export type FillStep = {
  action: 'fill',
  options: {
    position: Position,
    size?: { width: number, height: number },
    color: DIGIT
  },
  newOutput: Array<Array<Array<DIGIT>>>,
}

export type Step = ResizeStep | CopyStep | ClearStep | FillStep | RotateStep | FlipStep | ProjectStep;