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
    direction: 'up' | 'down' | 'left' | 'right' | 'north' | 'south' | 'east' | 'west'
  },
  newOutput: Array<Array<Array<DIGIT>>>,
}

// export type MatchStep = {
//   action: 'match',
//   options: {
//     from: {
//       position: Position,
//       size: Size,
//     },
//     to: {
//       position: Position
//     }
//   },
//   newOutput: Array<Array<Array<DIGIT>>>,
// }

export type CopyStep = {
  action: 'copy' | 'match',
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

export type FocusStep = {
  action: 'focus',
  options: {
    position: Position,
    size: Size,
  },
  // newOutput: Array<Array<Array<DIGIT>>>, // no change to output
}

export type SetCounterStep = {
  action: 'set-counter',
  counterIndex: number, // 0 to 2
  value: number,
}

export type ScaleStep = {
  action: 'scale',
  options: {
    position: Position,
    size: Size,
    factor: number,
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
    color: DIGIT,
    targetColor: DIGIT,
    isFillAll: boolean,
  },
  newOutput: Array<Array<Array<DIGIT>>>,
}

export type Step = ResizeStep | CopyStep | ClearStep | FillStep | RotateStep | FlipStep | ProjectStep | FocusStep | SetCounterStep | ScaleStep; //| MatchStep;