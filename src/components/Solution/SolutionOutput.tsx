import { useContext, useState, type KeyboardEvent } from "react";
import { AppContext, type AppContextProps } from "../Context/AppContext";
import { Layer, Rect, Stage } from "react-konva";
import { COLOR_MAP, UNIT, type DIGIT } from "../../const";
import { type Position } from "../../types/position";
import { isBetweenPosition } from "../../utils/isBetween";
import { cloneDeep } from "lodash"
import { boundaryFill } from "../../utils/boundaryFill";
import { projectRect } from "../../utils/projectRect";
import type { CopyStep, FillStep, FlipStep, ProjectStep, RotateStep } from "../../types/step";
import { projectRectForce } from "../../utils/projectRectForce";
import { Box } from "@mui/material";

export default function SolutionOutput() {

  const { outputSolution, selectedCell, setOutputSolution, handleChangeSelectedCell, inputSolution, step, setStep, currentOutputIndex, setCurrentOutputIndex } = useContext<AppContextProps>(AppContext);

  const [selectedPos, setSelectedPos] = useState<Position | null>(null);

  const [startPosition, setStartPosition] = useState<Position | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [endPosition, setEndPosition] = useState<Position | null>(null);


  const handleOnClick = (k: number, i: number, j: number) => {
    // Handle cell click
    setSelectedPos({ x: j, y: i, z: k });
    if (selectedCell.mode === "edit") {
      outputSolution[currentOutputIndex][i][j] = selectedCell.color;
      setOutputSolution(outputSolution.map((output, index) => {
        if (index === k) {
          const newOutput = cloneDeep(output);
          newOutput[i][j] = selectedCell.color;
          return newOutput;
        }
        return output;
      }));
      const newStep: FillStep = {
        action: 'fill',
        options: {
          position: { x: j, y: i, z: currentOutputIndex },
          size: { width: 1, height: 1 },
          color: selectedCell.color
        },
        newOutput: outputSolution.map((output, index) => {
          if (index === k) {
            const newOutput = cloneDeep(output);
            newOutput[i][j] = selectedCell.color;
            return newOutput;
          }
          return output;
        })  
      };
      setStep([...step, newStep]);
    } else if (selectedCell.mode === "fill") {
      const currentColor = outputSolution[k][i][j];
      setOutputSolution(outputSolution.map((output, index) => {
        if (index === k) {
          const newOutput = cloneDeep(output);
          boundaryFill(i, j, currentColor, selectedCell.color, newOutput);
          return newOutput;
        }
        return output;
      }));
      const newStep: FillStep = {
        action: 'fill',
        options: {
          position: { x: j, y: i, z: currentOutputIndex },
          color: selectedCell.color
        },
        newOutput: outputSolution.map((output, index) => {
          if (index === k) {
            const newOutput = cloneDeep(output);
            boundaryFill(i, j, currentColor, selectedCell.color, newOutput);
            return newOutput;
          }
          return output;
        })
      };
      setStep([...step, newStep]);
    }
  }

  // Select:Ctrl+c/v=copy/paste, r=rotate, h/v=flip, arrow=project, ctrl+arrow=force project
  const handleChangeInput = (e: KeyboardEvent<HTMLDivElement>) => {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    if (isCtrlOrCmd && e.key === 'c' && startPosition && endPosition && selectedCell.mode === "select") {
      const x = Math.min(startPosition.x, endPosition.x);
      const y = Math.min(startPosition.y, endPosition.y);
      const sx = Math.abs(startPosition.x - endPosition.x) + 1;
      const sy = Math.abs(startPosition.y - endPosition.y) + 1;
      handleChangeSelectedCell({...selectedCell, copyPosition: { z: startPosition.z || 0, x, y, sx, sy, source: 'output' } });
    }

    if (isCtrlOrCmd && e.key === 'v' && selectedCell.mode === "select" && selectedPos && selectedCell.copyPosition) {
      // Handle paste operation
      const newOutput = cloneDeep(outputSolution);
      const newRows = newOutput[currentOutputIndex].length;
      const newCols = newOutput[currentOutputIndex][0].length;
      const { z, x, y, sx, sy, source } = selectedCell.copyPosition;

      const newStep: CopyStep = {
        action: 'copy',
        options: {
          from: {
            source: 'output',
            position: { z: z || 0, x, y },
            size: { width: sx, height: sy },
          },
          to: {
            position: { x: selectedPos.x, y: selectedPos.y, z: selectedPos.z || 0 }
          }
        },
        newOutput
      };

      if (source === 'input' && inputSolution) {
        
        const minDeltaRows = Math.min(sx, newRows - selectedPos.x);
        const minDeltaCols = Math.min(sy, newCols - selectedPos.y);

        for (let i = 0; i < minDeltaRows; i++) {
          for (let j = 0; j < minDeltaCols; j++) {
            newOutput[selectedPos.z || 0][selectedPos.y + j][selectedPos.x + i] = inputSolution[y + j][x + i];
          }
        }

        setOutputSolution(oldOutput => {
          for (let i = 0; i < minDeltaRows; i++) {
            for (let j = 0; j < minDeltaCols; j++) {
              oldOutput[selectedPos.z || 0][selectedPos.y + j][selectedPos.x + i] = inputSolution[y + j][x + i];
            }
          }
          return oldOutput;
        });
        newStep.options.from.source = "input";
      }
      else if (source === 'output') {
        const minDeltaRows = Math.min(sx, newRows - selectedPos.x);
        const minDeltaCols = Math.min(sy, newCols - selectedPos.y);
        for (let i = 0; i < minDeltaRows; i++) {
          for (let j = 0; j < minDeltaCols; j++) {
            newOutput[selectedPos.z || 0][selectedPos.y + j][selectedPos.x + i] = outputSolution[z || 0][y + j][x + i];
          }
        }

        setOutputSolution(oldOutput => {
          for (let i = 0; i < minDeltaRows; i++) {
            for (let j = 0; j < minDeltaCols; j++) {
              oldOutput[selectedPos.z || 0][selectedPos.y + j][selectedPos.x + i] = outputSolution[z || 0][y + j][x + i];
            }
          }
          return oldOutput;
        });
      }
      newStep.newOutput = newOutput;
      setStep([...step, newStep]);
    }
    // rotate the selected area 90 degree clockwise
    if (e.key === 'r' && selectedCell.mode === "select" && selectedCell.position) {
      const { x, y, sx, sy } = selectedCell.position;
      if (sx !== sy) {
        alert("Only square selection can be rotated");
        return;
      }
      const newOutput = cloneDeep(outputSolution);
      // Create a temporary matrix to hold the rotated values
      const tempMatrix = Array.from({ length: sx }, () => Array.from({ length: sy }, () => "-1" as DIGIT ));
      for (let i = 0; i < sx; i++) {
        for (let j = 0; j < sy; j++) {
          tempMatrix[i][j] = outputSolution[currentOutputIndex][y + i][x + j];
        }
      }
      
      // Rotate 90 degree clockwise and copy to newOutput
      for (let i = 0; i < sx; i++) {
        for (let j = 0; j < sy; j++) {
          newOutput[currentOutputIndex][y + i][x + j] = tempMatrix[sy - 1 - j][i];
        }
      }
      setOutputSolution(newOutput);
      const newStep: RotateStep = {
        action: 'rotate',
        options: {
          position: { x, y, z: currentOutputIndex },
          size: { width: sx, height: sy },
        },
        newOutput
      };
      setStep([...step, newStep]);
    }
    // flip the selected area horizontally
    if (e.key === 'h' && selectedCell.mode === "select" && selectedCell.position) {
      const { x, y, sx, sy } = selectedCell.position;
      const newOutput = cloneDeep(outputSolution);
      // Create a temporary matrix to hold the flipped values
      const tempMatrix = Array.from({ length: sx }, () => Array.from({ length: sy }, () => "-1" as DIGIT ));
      for (let i = 0; i < sy; i++) {
        for (let j = 0; j < sx; j++) {
          tempMatrix[i][j] = outputSolution[currentOutputIndex][y + i][x + j];
        }
      }
      
      // Flip horizontally and copy to newOutput
      for (let i = 0; i < sy; i++) {
        for (let j = 0; j < sx; j++) {
          newOutput[currentOutputIndex][y + i][x + j] = tempMatrix[i][sx - 1 - j];
        }
      }
      setOutputSolution(newOutput);
      const newStep: FlipStep = {
        action: 'flip',
        options: {
          position: { x, y, z: currentOutputIndex },
          size: { width: sx, height: sy },
          direction: 'horizontal'
        },
        newOutput
      };
      setStep([...step, newStep]);
    }
    // flip the selected area vertically
    if (e.key === 'v' && selectedCell.mode === "select" && selectedCell.position) {
      const { x, y, sx, sy } = selectedCell.position;
      const newOutput = cloneDeep(outputSolution);
      // Create a temporary matrix to hold the flipped values
      const tempMatrix = Array.from({ length: sx }, () => Array.from({ length: sy }, () => "-1" as DIGIT ));
      for (let i = 0; i < sy; i++) {
        for (let j = 0; j < sx; j++) {
          tempMatrix[i][j] = outputSolution[currentOutputIndex][y + i][x + j];
        }
      }
      
      // Flip vertically and copy to newOutput
      for (let i = 0; i < sy; i++) {
        for (let j = 0; j < sx; j++) {
          newOutput[currentOutputIndex][y + i][x + j] = tempMatrix[sy - 1 - i][j];
        }
      }

      setOutputSolution(newOutput);
      const newStep: FlipStep = {
        action: 'flip',
        options: {
          position: { x, y, z: currentOutputIndex },
          size: { width: sx, height: sy },
          direction: 'vertical'
        },
        newOutput
      };
      setStep([...step, newStep]);
    }
    // project the selected area up, down, left, right
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedCell.mode === "select" && selectedCell.position) {
      const directionMap: { [key: string]: 'up' | 'down' | 'left' | 'right' } = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right'
      };
      const direction = directionMap[e.key];
      if (direction) {
        const { x, y, sx, sy } = selectedCell.position;
        // Rect = selected area, a temp matrix to hold the area to be projected
        const newOutput = cloneDeep(outputSolution);
        const tempMatrix = Array.from({ length: sy }, () => Array.from({ length: sx }, () => "-1" as DIGIT));
        for (let i = 0; i < sy; i++) {
          for (let j = 0; j < sx; j++) {
            tempMatrix[i][j] = newOutput[currentOutputIndex][y + i][x + j];
          }
        }
        projectRect(tempMatrix, direction);
        // copy the projected tempMatrix back to newOutput
        for (let i = 0; i < sy; i++) {
          for (let j = 0; j < sx; j++) {
            newOutput[currentOutputIndex][y + i][x + j] = tempMatrix[i][j];
          }
        }
        setOutputSolution(newOutput);
        const newStep: ProjectStep = {
          action: 'project',
          options: {
            position: { x, y, z: currentOutputIndex },
            size: { width: sx, height: sy },
            direction
          },
          newOutput
        };
        setStep([...step, newStep]);
      }
    }
    // force project the selected area up, down, left, right, using project-pen
    if (isCtrlOrCmd && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedCell.mode === "select" && selectedCell.position) {
      const directionMap: { [key: string]: 'up' | 'down' | 'left' | 'right' } = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right'
      };
      const direction = directionMap[e.key];
      if (direction) {
        const { x, y, sx, sy } = selectedCell.position;
        // Rect = selected area, a temp matrix to hold the area to be projected
        const newOutput = cloneDeep(outputSolution);
        const tempMatrix = Array.from({ length: sy }, () => Array.from({ length: sx }, () => "-1" as DIGIT));
        for (let i = 0; i < sy; i++) {
          for (let j = 0; j < sx; j++) {
            tempMatrix[i][j] = newOutput[currentOutputIndex][y + i][x + j];
          }
        }
        projectRectForce(tempMatrix, direction);
        // copy the projected tempMatrix back to newOutput
        for (let i = 0; i < sy; i++) {
          for (let j = 0; j < sx; j++) {
            newOutput[currentOutputIndex][y + i][x + j] = tempMatrix[i][j];
          }
        }
        setOutputSolution(newOutput);
        const newStep: ProjectStep = {
          action: 'project-force',
          options: {
            position: { x, y, z: currentOutputIndex },
            size: { width: sx, height: sy },
            direction
          },
          newOutput
        };
        setStep([...step, newStep]);
      }
    }
  }

  return (
    <>
      {outputSolution?.map((solutions, k) => (
        <Box key={k} display="flex" flexDirection='column' marginBottom={2} onClick={() => setCurrentOutputIndex(k)} tabIndex={0} onKeyDown={handleChangeInput}>
          <Stage height={solutions.length * UNIT} width={solutions[0].length * UNIT}>
            <Layer>
              {solutions.map((row, i) =>
                row.map((cell, j) => (
                  <Rect
                    key={`${i}-${j}`}
                    x={j * UNIT}
                    y={i * UNIT}
                    width={UNIT}
                    height={UNIT}
                    fill={COLOR_MAP[cell] || "#ffffff"}
                    stroke="#fbfafaff"
                    strokeWidth={1}
                    onClick={() => handleOnClick(k, i, j)}
                    onMouseDown={() => { if (selectedCell.mode === "select") {
                      setStartPosition({ x: j, y: i, z: k })
                      setCurrentPosition(null)
                      setEndPosition(null) 
                    }}}
                    onMouseUp={() => { if (selectedCell.mode === "select") {
                      setEndPosition({ x: j, y: i, z: k })
                      if (startPosition) {
                        const x = Math.min(startPosition.x, j);
                        const y = Math.min(startPosition.y, i);
                        const sx = Math.abs(startPosition.x - j) + 1;
                        const sy = Math.abs(startPosition.y - i) + 1;
                        handleChangeSelectedCell({...selectedCell, position: { z: k, x, y, sx, sy, source: 'output' } });
                      }
                    }}}
                    onMouseOver={() => { if (startPosition && !endPosition) setCurrentPosition({ x: j, y: i, z: k }) }}
                    opacity={startPosition && currentPosition && isBetweenPosition(startPosition, currentPosition, { x: j, y: i, z: k }) ? 0.5 : 1}
                  />
                ))
              )}
            </Layer>
          </Stage>
        </Box>
      ))}
    </>
  );
}


