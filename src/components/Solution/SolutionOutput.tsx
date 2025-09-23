import { useContext, useEffect, useState } from "react";
import { AppContext, type AppContextProps } from "../Context/AppContext";
import { Layer, Rect, Stage } from "react-konva";
import { COLOR_MAP, DEFAULT_SELECTED_CELL, UNIT, type DIGIT } from "../../const";
import { type Position } from "../../types/position";
import { isBetweenPosition } from "../../utils/isBetween";
import { cloneDeep } from "lodash"
import { boundaryFill } from "../../utils/boundaryFill";
import { projectRect } from "../../utils/projectRect";
import type { CopyStep, FillStep, FlipStep, ProjectStep, RotateStep } from "../../types/step";
import { projectRectForce } from "../../utils/projectRectForce";
import { projectLine } from "../../utils/projectLine";

export default function SolutionOutput({ outputIndex }: { outputIndex: number }) {

  const { startPosition, setStartPosition, currentPosition, setCurrentPosition, endPosition, setEndPosition, outputSolution, selectedCell, handleChangeOutputSolution, handleChangeSelectedCell, inputSolution, step, setStep, choosenTrainingId } = useContext<AppContextProps>(AppContext);
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const rows = outputSolution[outputIndex].length;
  const cols = outputSolution[outputIndex][0].length;


  const handleOnClick = (i: number, j: number) => {
    // Handle cell click
    setSelectedPos({x: j, y: i, source: 'output', matrixIndex: outputIndex});
    if (selectedCell.mode === "edit") {
      const newOutputSolution = cloneDeep(outputSolution);
      const targetColor = newOutputSolution[outputIndex][i][j];
      newOutputSolution[outputIndex][i][j] = selectedCell.color;
      handleChangeOutputSolution(newOutputSolution);
      const newStep: FillStep = {
        action: 'fill',
        options: {
          position: { x: j, y: i, source: 'output', matrixIndex: outputIndex },
          size: {width: 1, height: 1},
          color: selectedCell.color,
          targetColor,
          isFillAll: true,
        },
        newOutput: newOutputSolution
      };
      setStep([...step, newStep]);
    }
    else if (selectedCell.mode === "fill") {
      const currentColor = outputSolution[outputIndex][i][j];
      const newOutputSolution = cloneDeep(outputSolution);
      const targetColor = newOutputSolution[outputIndex][i][j];
      boundaryFill(j, i, currentColor, selectedCell.color, newOutputSolution[outputIndex]);
      handleChangeOutputSolution(newOutputSolution);
      const newStep: FillStep = {
        action: 'fill-boundary',
        options: {
          position: { x: j, y: i, source: 'output', matrixIndex: outputIndex },
          size: {width: 1, height: 1},
          color: selectedCell.color,
          targetColor,
          isFillAll: false
        },
        newOutput: newOutputSolution
      };
      setStep([...step, newStep]);
    }
  }

  // Select:Ctrl+c/v=copy/paste, r=rotate, h/v=flip, arrow=project (up, down, left, right. rectangle area selected), n=project north, s=project south, e=project east, w=project west (on selected line), ctrl+arrow=force project, m=match
  const handleChangeInput = (e: KeyboardEvent) => {
    // Escape key to cancel selection
    if (e.key === 'Escape' && selectedCell.mode === "select") {
      setCurrentPosition(null);
      setStartPosition(null);
      setEndPosition(null);
      handleChangeSelectedCell(cloneDeep(DEFAULT_SELECTED_CELL));
    }
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    if (isCtrlOrCmd && e.key === 'c' && selectedCell.mode === "select" && !selectedCell.isCopied && selectedCell.position && selectedCell.position.source === 'output' && selectedCell.position.matrixIndex === outputIndex) {
      const { x, y, source, matrixIndex } = selectedCell.position;
      const sx = selectedCell.size ? selectedCell.size.width : 1;
      const sy = selectedCell.size ? selectedCell.size.height : 1;
      handleChangeSelectedCell({...selectedCell, position: { x, y, source, matrixIndex }, size: { width: sx, height: sy }, isCopied: true });
    }
    if (isCtrlOrCmd && e.key === 'v' && selectedCell.mode === "select" && selectedPos && selectedPos.matrixIndex === outputIndex && selectedCell.position && selectedCell.isCopied) {
      // Handle paste operation
      setStartPosition(selectedPos);
      const newOutput = cloneDeep(outputSolution);
      const newRows = newOutput[outputIndex].length;
      const newCols = newOutput[outputIndex][0].length;
      const { x, y, source, matrixIndex } = selectedCell.position;
      const sx = selectedCell.size ? selectedCell.size.width : 1;
      const sy = selectedCell.size ? selectedCell.size.height : 1;

      if (source === 'input' && inputSolution) {
        const minDeltaRows = Math.min(sy, newRows - selectedPos.y);
        const minDeltaCols = Math.min(sx, newCols - selectedPos.x);
        for (let i = 0; i < minDeltaRows; i++) {
          for (let j = 0; j < minDeltaCols; j++) {
            newOutput[outputIndex][selectedPos.y + i][selectedPos.x + j] = inputSolution[matrixIndex][y + i][x + j];
          }
        }
        // The new selectedCell is now the newly pasted area
        handleChangeSelectedCell({...selectedCell, position: { x: selectedPos.x, y: selectedPos.y, source: 'output', matrixIndex: outputIndex }, size: { width: minDeltaCols, height: minDeltaRows }, isCopied: false });
        setEndPosition({ x: selectedPos.x + minDeltaCols - 1, y: selectedPos.y + minDeltaRows - 1, source: 'output', matrixIndex: outputIndex });
      }
      else if (source === 'output') {
        const minDeltaRows = Math.min(sy, newRows - selectedPos.y);
        const minDeltaCols = Math.min(sx, newCols - selectedPos.x);
        for (let i = 0; i < minDeltaRows; i++) {
          for (let j = 0; j < minDeltaCols; j++) {
            newOutput[outputIndex][selectedPos.y + i][selectedPos.x + j] = outputSolution[matrixIndex][y + i][x + j];
          }
        }
        // The new selectedCell is now the newly pasted area
        handleChangeSelectedCell({...selectedCell, position: { x: selectedPos.x, y: selectedPos.y, source: 'output', matrixIndex: outputIndex }, size: { width: minDeltaCols, height: minDeltaRows }, isCopied: false });
        setEndPosition({ x: selectedPos.x + minDeltaCols - 1, y: selectedPos.y + minDeltaRows - 1, source: 'output', matrixIndex: outputIndex });
      }

      const newStep: CopyStep = {
        action: 'copy',
        options: {
          from: {
            position: { x, y, source, matrixIndex },
            size: { width: sx, height: sy },
          },
          to: {
            position: { x: selectedPos.x, y: selectedPos.y, source: 'output', matrixIndex: outputIndex },
          }
        },
        newOutput
      };
      handleChangeOutputSolution(newOutput);
      setStep([...step, newStep]);
    }

    // Match the selected area to the destination area
    // shift+Ctrl+m
    if (e.key === 'm' && selectedCell.mode === "select" && selectedPos && selectedPos.matrixIndex === outputIndex && selectedCell.position && selectedCell.isCopied) {
      // Handle paste operation
      setStartPosition(selectedPos);
      const newOutput = cloneDeep(outputSolution);
      const newRows = newOutput[outputIndex].length;
      const newCols = newOutput[outputIndex][0].length;
      const { x, y, source, matrixIndex } = selectedCell.position;
      const sx = selectedCell.size ? selectedCell.size.width : 1;
      const sy = selectedCell.size ? selectedCell.size.height : 1;

      if (source === 'input' && inputSolution) {
        const minDeltaRows = Math.min(sy, newRows - selectedPos.y);
        const minDeltaCols = Math.min(sx, newCols - selectedPos.x);
        for (let i = 0; i < minDeltaRows; i++) {
          for (let j = 0; j < minDeltaCols; j++) {
            newOutput[outputIndex][selectedPos.y + i][selectedPos.x + j] = (newOutput[outputIndex][selectedPos.y + i][selectedPos.x + j] === inputSolution[matrixIndex][y + i][x + j])? inputSolution[matrixIndex][y + i][x + j] : "-1" as DIGIT;
          }
        }
        // The new selectedCell is now the newly pasted area
        handleChangeSelectedCell({...selectedCell, position: { x: selectedPos.x, y: selectedPos.y, source: 'output', matrixIndex: outputIndex }, size: { width: minDeltaCols, height: minDeltaRows }, isCopied: false });
        setEndPosition({ x: selectedPos.x + minDeltaCols - 1, y: selectedPos.y + minDeltaRows - 1, source: 'output', matrixIndex: outputIndex });
      }
      else if (source === 'output') {
        const minDeltaRows = Math.min(sy, newRows - selectedPos.y);
        const minDeltaCols = Math.min(sx, newCols - selectedPos.x);
        for (let i = 0; i < minDeltaRows; i++) {
          for (let j = 0; j < minDeltaCols; j++) {
            newOutput[outputIndex][selectedPos.y + i][selectedPos.x + j] = (newOutput[outputIndex][selectedPos.y + i][selectedPos.x + j] === outputSolution[matrixIndex][y + i][x + j])? outputSolution[matrixIndex][y + i][x + j] : "-1" as DIGIT;
          }
        }
        // The new selectedCell is now the newly pasted area
        handleChangeSelectedCell({...selectedCell, position: { x: selectedPos.x, y: selectedPos.y, source: 'output', matrixIndex: outputIndex }, size: { width: minDeltaCols, height: minDeltaRows }, isCopied: false });
        setEndPosition({ x: selectedPos.x + minDeltaCols - 1, y: selectedPos.y + minDeltaRows - 1, source: 'output', matrixIndex: outputIndex });
      }

      const newStep: CopyStep = {
        action: 'match',
        options: {
          from: {
            position: { x, y, source, matrixIndex },
            size: { width: sx, height: sy },
          },
          to: {
            position: { x: selectedPos.x, y: selectedPos.y, source: 'output', matrixIndex: outputIndex },
          }
        },
        newOutput
      };
      handleChangeOutputSolution(newOutput);
      setStep([...step, newStep]);
    }


    if (e.key === 'r' && selectedCell.mode === "select" && selectedCell.position && selectedCell.position.source === 'output' && selectedCell.position.matrixIndex === outputIndex && !selectedCell.isCopied) {
      const { x, y } = selectedCell.position;
      const sx = selectedCell.size?.width || 1;
      const sy = selectedCell.size?.height || 1;
      if (sx !== sy) {
        alert("Only square selection can be rotated");
        return;
      }
      const newOutput = cloneDeep(outputSolution);
      // Create a temporary matrix to hold the rotated values
      const tempMatrix = Array.from({ length: sx }, () => Array.from({ length: sx }, () => 0 as DIGIT ));
      for (let i = 0; i < sx; i++) {
        for (let j = 0; j < sx; j++) {
          tempMatrix[i][j] = outputSolution[outputIndex][y + i][x + j];
        }
      }
      
      // Rotate 90 degree clockwise and copy to newOutput
      for (let i = 0; i < sx; i++) {
        for (let j = 0; j < sx; j++) {
          newOutput[outputIndex][y + i][x + j] = tempMatrix[sy - 1 - j][i];
        }
      }
      handleChangeOutputSolution(newOutput);
      const newStep: RotateStep = {
        action: 'rotate',
        options: {
          position: { x, y, source: 'output', matrixIndex: outputIndex },
          size: { width: sx, height: sy },
        },
        newOutput
      };
      setStep([...step, newStep]);
    }
    // flip the selected area horizontally
    if (e.key === 'h' && selectedCell.mode === "select" && selectedCell.position && selectedCell.position.source === 'output' && selectedCell.position.matrixIndex === outputIndex && !selectedCell.isCopied) {
      const { x, y } = selectedCell.position;
      const sx = selectedCell.size?.width || 1;
      const sy = selectedCell.size?.height || 1;
      const newOutput = cloneDeep(outputSolution);
      // Create a temporary matrix to hold the flipped values
      const tempMatrix = Array.from({ length: sy }, () => Array.from({ length: sx }, () => 0 as DIGIT ));
      for (let i = 0; i < sy; i++) {
        for (let j = 0; j < sx; j++) {
          tempMatrix[i][j] = outputSolution[outputIndex][y + i][x + j];
        }
      }
      // Flip horizontally and copy to newOutput
      for (let i = 0; i < sy; i++) {
        for (let j = 0; j < sx; j++) {
          newOutput[outputIndex][y + i][x + j] = tempMatrix[i][sx - 1 - j];
        }
      }
      handleChangeOutputSolution(newOutput);
      const newStep: FlipStep = {
        action: 'flip',
        options: {
          position: { x, y, source: 'output', matrixIndex: outputIndex },
          size: { width: sx, height: sy },
          direction: 'horizontal'
        },
        newOutput
      };
      setStep([...step, newStep]);
    }
    // flip the selected area vertically
    if (!isCtrlOrCmd && e.key === 'v' && selectedCell.mode === "select" && selectedCell.position && selectedCell.position.source === 'output' && selectedCell.position.matrixIndex === outputIndex && !selectedCell.isCopied) {
      const { x, y } = selectedCell.position;
      const sx = selectedCell.size?.width || 1;
      const sy = selectedCell.size?.height || 1;
      const newOutput = cloneDeep(outputSolution);
      // Create a temporary matrix to hold the flipped values
      const tempMatrix = Array.from({ length: sy }, () => Array.from({ length: sx }, () => 0 as DIGIT ));
      for (let i = 0; i < sy; i++) {
        for (let j = 0; j < sx; j++) {
          tempMatrix[i][j] = outputSolution[outputIndex][y + i][x + j];
        }
      }
      
      // Flip vertically and copy to newOutput
      for (let i = 0; i < sy; i++) {
        for (let j = 0; j < sx; j++) {
          newOutput[outputIndex][y + i][x + j] = tempMatrix[sy - 1 - i][j];
        }
      }

      handleChangeOutputSolution(newOutput);
      const newStep: FlipStep = {
        action: 'flip',
        options: {
          position: { x, y, source: 'output', matrixIndex: outputIndex },
          size: { width: sx, height: sy },
          direction: 'vertical'
        },
        newOutput
      };
      setStep([...step, newStep]);
    }
    // project the selected area up, down, left, right
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedCell.mode === "select" && selectedCell.position && selectedCell.position.source === 'output' && selectedCell.position.matrixIndex === outputIndex && !selectedCell.isCopied) {
      const directionMap: { [key: string]: 'up' | 'down' | 'left' | 'right' } = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right'
      };
      const direction = directionMap[e.key];
      if (direction) {
        const { x, y } = selectedCell.position;
        const sx = selectedCell.size?.width || 1;
        const sy = selectedCell.size?.height || 1;
        // Rect = selected area, a temp matrix to hold the area to be projected
        const newOutput = cloneDeep(outputSolution);
        const tempMatrix = Array.from({ length: sy }, () => Array.from({ length: sx }, () => 0 as DIGIT));
        for (let i = 0; i < sy; i++) {
          for (let j = 0; j < sx; j++) {
            tempMatrix[i][j] = newOutput[outputIndex][y + i][x + j];
          }
        }
        projectRect(tempMatrix, direction);
        // copy the projected tempMatrix back to newOutput
        for (let i = 0; i < sy; i++) {
          for (let j = 0; j < sx; j++) {
            newOutput[outputIndex][y + i][x + j] = tempMatrix[i][j];
          }
        }
        handleChangeOutputSolution(newOutput);
        const newStep: ProjectStep = {
          action: 'project',
          options: {
            position: { x, y, source: 'output', matrixIndex: outputIndex },
            size: { width: sx, height: sy },
            direction
          },
          newOutput
        };
        setStep([...step, newStep]);
      }
    }
    // check if conition
    // diagonally project the selected line up-right, down-left, up-left, down-right (north, south, east, west)
    if (['n', 's', 'e', 'w'].includes(e.key) && selectedCell.mode === "select" && selectedCell.position && selectedCell.position.source === 'output' && selectedCell.position.matrixIndex === outputIndex && !selectedCell.isCopied && selectedCell.size && (selectedCell.size.width === 1 || selectedCell.size.height === 1)) {
      const directionMap: { [key: string]: 'north' | 'south' | 'east' | 'west' } = {
        'n': 'north',
        's': 'south',
        'e': 'east',
        'w': 'west'
      };
      const direction = directionMap[e.key];
      if (direction) {
        const { x, y } = selectedCell.position;
        const sx = selectedCell.size?.width || 1;
        const sy = selectedCell.size?.height || 1;
        const newOutput = cloneDeep(outputSolution);
        // project directly on the matrix
        projectLine(newOutput[outputIndex], {x, y}, {width: sx, height: sy}, direction);
        handleChangeOutputSolution(newOutput);
        const newStep: ProjectStep = {
          action: 'project',
          options: {
            position: { x, y, source: 'output', matrixIndex: outputIndex },
            size: { width: sx, height: sy },
            direction
          },
          newOutput
        };
        setStep([...step, newStep]);
      }
    }

    // force project the selected area up, down, left, right, using project-pen
    if (isCtrlOrCmd && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedCell.mode === "select" && selectedCell.position && !selectedCell.isCopied) {
      const directionMap: { [key: string]: 'up' | 'down' | 'left' | 'right' } = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right'
      };
      const direction = directionMap[e.key];
      if (direction) {
        const { x, y } = selectedCell.position;
        const sx = selectedCell.size?.width || 1;
        const sy = selectedCell.size?.height || 1;
        // Rect = selected area, a temp matrix to hold the area to be projected
        const newOutput = cloneDeep(outputSolution);
        const tempMatrix = Array.from({ length: sy }, () => Array.from({ length: sx }, () => 0 as DIGIT));
        for (let i = 0; i < sy; i++) {
          for (let j = 0; j < sx; j++) {
            tempMatrix[i][j] = newOutput[outputIndex][y + i][x + j];
          }
        }
        projectRectForce(tempMatrix, direction);
        // copy the projected tempMatrix back to newOutput
        for (let i = 0; i < sy; i++) {
          for (let j = 0; j < sx; j++) {
            newOutput[outputIndex][y + i][x + j] = tempMatrix[i][j];
          }
        }
        handleChangeOutputSolution(newOutput);
        const newStep: ProjectStep = {
          action: 'project-force',
          options: {
            position: { x, y, source: 'output', matrixIndex: outputIndex },
            size: { width: sx, height: sy },
            direction
          },
          newOutput
        };
        setStep([...step, newStep]);
      }
    }
  }

  useEffect(() => {
      window.addEventListener('keydown', handleChangeInput);
      return () => {
        window.removeEventListener('keydown', handleChangeInput);
      };
  }, [startPosition, endPosition, selectedCell, outputSolution, selectedPos, step]);  
  useEffect(() => {
    if (selectedCell.mode !== "select") {
      setCurrentPosition(null);
      setStartPosition(null);
      setEndPosition(null);
    }
  }, [selectedCell.mode]);

  // Reset pointers when choosenTrainingId changes
  useEffect(() => {
    setCurrentPosition(null);
    setStartPosition(null);
    setEndPosition(null);
    handleChangeSelectedCell(cloneDeep(DEFAULT_SELECTED_CELL));
  }, [choosenTrainingId]);

  return (
    <Stage width={cols * UNIT} height={rows * UNIT}>
      <Layer>
        {outputSolution[outputIndex].map((row, i) =>
          row.map((cell, j) => (
            <Rect
              key={`${i}-${j}`}
              x={j * UNIT}
              y={i * UNIT}
              width={UNIT}
              height={UNIT}
              fill={COLOR_MAP[cell] || "#000000ff"}
              stroke="#fbfafaff"
              strokeWidth={1}
              onClick={() => handleOnClick(i, j)}
              onMouseDown={() => { if (selectedCell.mode === "select") {
                setStartPosition({ x: j, y: i, source: 'output', matrixIndex: outputIndex })
                setCurrentPosition(null)
                setEndPosition(null) 
              }}}
              onMouseUp={() => { if (selectedCell.mode === "select") {
                setEndPosition({ x: j, y: i, source: 'output', matrixIndex: outputIndex })
                if (startPosition) {
                  const x = Math.min(startPosition.x, j);
                  const y = Math.min(startPosition.y, i);
                  const sx = Math.abs(startPosition.x - j) + 1;
                  const sy = Math.abs(startPosition.y - i) + 1;
                  if ((startPosition.x != j || startPosition.y != i) && startPosition.matrixIndex === outputIndex && startPosition.source === 'output') {
                    handleChangeSelectedCell({...selectedCell, position: { x, y, source: 'output', matrixIndex: outputIndex }, size: { width: sx, height: sy }, isCopied: false });
                  }
              }}}}
              onMouseOver={() => { if (startPosition && !endPosition) setCurrentPosition({ x: j, y: i, source: 'output', matrixIndex: outputIndex }) }}
              opacity={!selectedCell?.isCopied && selectedCell.position?.source === 'output' && selectedCell.position?.matrixIndex === outputIndex && startPosition && ( currentPosition && isBetweenPosition(startPosition, currentPosition, { x: j, y: i, source: 'output', matrixIndex: outputIndex }) || endPosition && isBetweenPosition(startPosition, endPosition, { x: j, y: i, source: 'output', matrixIndex: outputIndex })) ? 0.5 : 1}
            />
          ))
        )}
      </Layer>
    </Stage>
  );
}