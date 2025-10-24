import { DEFAULT_SOLUTION_MATRIX, type DIGIT } from "../const"
import type { Position } from "./position"
import type { Size } from "./size"

export type Step = {
  action: 'resize' | 'rotate' | 'flip' | 'project' | 'copy' | 'match' | 're-scale' | 'fill' | 'fill-boundary' | 'default',
  position: Position,
  fromPosition: Position,
  size: Size,
  color: DIGIT,
  targetColor: DIGIT,
  isFillAll: boolean,
  scaleFactor: number,
  direction: 'up' | 'down' | 'left' | 'right' | 'north' | 'south' | 'east' | 'west' | 'horizontal' | 'vertical' | 'default',
  newOutput: Array<Array<DIGIT>>,
}

export const DEFAULT_STEP: Step = {
  action: 'default',
  position: { x: 0, y: 0, source: 'output' },
  fromPosition: { x: 0, y: 0, source: 'output' },
  size: { width: 1, height: 1 },
  color: -1,
  targetColor: -1,
  isFillAll: false,
  scaleFactor: 1,
  direction: 'default',
  newOutput: DEFAULT_SOLUTION_MATRIX,
};

// export type ResizeStep = {
//   action: 'resize',
//   matrixIndex: number, // 1 to 4
//   options: {
//     size: Size,
//   },
//   newOutput: Array<Array<Array<DIGIT>>>,
// }

// export type RotateStep = {
//   action: 'rotate',
//   options: {
//     position: Position,
//     size: Size,
//     //direction: 'clockwise' | 'counterclockwise' // always clockwise for now
//   },
//   newOutput: Array<Array<Array<DIGIT>>>,
// }

// export type FlipStep = {
//   action: 'flip',
//   options: {
//     position: Position,
//     size: Size,
//     direction: 'horizontal' | 'vertical'
//   },
//   newOutput: Array<Array<Array<DIGIT>>>,
// }

// export type ProjectStep = {
//   action: 'project' | 'project-force',
//   options: {
//     position: Position,
//     size: Size,
//     direction: 'up' | 'down' | 'left' | 'right' | 'north' | 'south' | 'east' | 'west'
//   },
//   newOutput: Array<Array<Array<DIGIT>>>,
// }

// // export type MatchStep = {
// //   action: 'match',
// //   options: {
// //     from: {
// //       position: Position,
// //       size: Size,
// //     },
// //     to: {
// //       position: Position
// //     }
// //   },
// //   newOutput: Array<Array<Array<DIGIT>>>,
// // }

// export type CopyStep = {
//   action: 'copy' | 'match',
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

// export type FocusStep = {
//   action: 'focus',
//   options: {
//     position: Position,
//     size: Size,
//   },
//   // newOutput: Array<Array<Array<DIGIT>>>, // no change to output
// }

// export type SetCounterStep = {
//   action: 'set-counter',
//   counterIndex: number, // 0 to 2
//   value: number,
// }

// export type ScaleStep = {
//   action: 'scale',
//   options: {
//     position: Position,
//     size: Size,
//     factor: number,
//   },
//   newOutput: Array<Array<Array<DIGIT>>>,
// }

// export type ClearStep = {
//   action: 'clear',
//   matrixIndex: number, // 1 to 4
//   newOutput: Array<Array<Array<DIGIT>>>,
// }

// export type FillStep = {
//   action: 'fill' | 'fill-boundary',
//   options: {
//     position: Position,
//     size: Size,
//     color: DIGIT,
//     targetColor: DIGIT,
//     isFillAll: boolean,
//   },
//   newOutput: Array<Array<Array<DIGIT>>>,
// }

// export type Step = ResizeStep | CopyStep | ClearStep | FillStep | RotateStep | FlipStep | ProjectStep | FocusStep | SetCounterStep | ScaleStep; //| MatchStep;