import { useContext, useEffect, useState } from "react";
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

export default function SolutionOutput({ outputIndex }: { outputIndex: number }) {

  const { outputSolution, selectedCell, handleChangeOutputSolution, handleChangeSelectedCell, inputSolution, step, setStep } = useContext<AppContextProps>(AppContext);
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const rows = outputSolution[outputIndex].length;
  const cols = outputSolution[outputIndex][0].length;

  const [startPosition, setStartPosition] = useState<Position | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [endPosition, setEndPosition] = useState<Position | null>(null);


  const handleOnClick = (i: number, j: number) => {
    // Handle cell click
    setSelectedPos({ x: j, y: i });
    if (selectedCell.mode === "edit") {
      outputSolution[outputIndex][i][j] = selectedCell.color;
      handleChangeOutputSolution([...outputSolution]);
      const newStep: FillStep = {
        action: 'fill',
        matrixIndex: outputIndex,
        options: {
          position: { x: j, y: i },
          size: { width: 1, height: 1 },
          color: selectedCell.color
        },
        newOutput: [...outputSolution]
      };
      setStep([...step, newStep]);
    }
    else if (selectedCell.mode === "fill") {
      const currentColor = outputSolution[outputIndex][i][j];
      boundaryFill(i, j, currentColor, selectedCell.color, outputSolution[outputIndex]);
      handleChangeOutputSolution([...outputSolution]);
      const newStep: FillStep = {
        action: 'fill',
        matrixIndex: outputIndex,
        options: {
          position: { x: j, y: i },
          color: selectedCell.color
        },
        newOutput: [...outputSolution]
      };
      setStep([...step, newStep]);
    }
  }

  // Select:Ctrl+c/v=copy/paste, r=rotate, h/v=flip, arrow=project, ctrl+arrow=force project
  const handleChangeInput = (e: KeyboardEvent) => {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    if (isCtrlOrCmd && e.key === 'c' && startPosition && endPosition && selectedCell.mode === "select") {
      const x = Math.min(startPosition.x, endPosition.x);
      const y = Math.min(startPosition.y, endPosition.y);
      const sx = Math.abs(startPosition.x - endPosition.x) + 1;
      const sy = Math.abs(startPosition.y - endPosition.y) + 1;
      handleChangeSelectedCell({...selectedCell, position: { x, y, sx, sy, source: 'output', matrixIndex: outputIndex, isCopy: true } });
    }
    if (isCtrlOrCmd && e.key === 'v' && selectedCell.mode === "select" && selectedPos && selectedCell.position && selectedCell.position.isCopy) {
      // Handle paste operation
      const newOutput = cloneDeep(outputSolution);
      const newRows = newOutput[outputIndex].length;
      const newCols = newOutput[outputIndex][0].length;
      const { x, y, sx, sy, source, matrixIndex } = selectedCell.position;

      const newStep: CopyStep = {
        action: 'copy',
        options: {
          from: {
            source: 'output',
            matrixIndex: matrixIndex,
            position: { x, y },
            size: { width: sx, height: sy },
          },
          to: {
            matrixIndex: outputIndex,
            position: { x: selectedPos.x, y: selectedPos.y }
          }
        },
        newOutput
      };

      if (source === 'input' && inputSolution) {
        
        const minDeltaRows = Math.min(sx, newRows - selectedPos.x);
        const minDeltaCols = Math.min(sy, newCols - selectedPos.y);

        for (let i = 0; i < minDeltaRows; i++) {
          for (let j = 0; j < minDeltaCols; j++) {
            newOutput[outputIndex][selectedPos.y + j][selectedPos.x + i] = inputSolution[matrixIndex][y + j][x + i];
          }
        }

        newStep.options.from.source = "input";

      }
      else if (source === 'output') {

        const minDeltaRows = Math.min(sx, newRows - selectedPos.x);
        const minDeltaCols = Math.min(sy, newCols - selectedPos.y);
        for (let i = 0; i < minDeltaRows; i++) {
          for (let j = 0; j < minDeltaCols; j++) {
            newOutput[outputIndex][selectedPos.y + j][selectedPos.x + i] = outputSolution[outputIndex][y + j][x + i];
          }
        }
      }
      handleChangeOutputSolution(newOutput);
      // The new selectedCell is now the newly pasted area
      selectedCell.mode = "select";
      handleChangeSelectedCell({...selectedCell, position: { x: selectedPos.x, y: selectedPos.y, sx, sy, source: 'output', matrixIndex: outputIndex, isCopy: false } });
      setStep([...step, newStep]);
    }
    // rotate the selected area 90 degree clockwise
    if (e.key === 'r') {
      console.log(selectedCell.mode === "select");
      console.log(selectedCell.position);
      console.log(selectedCell.position && !selectedCell.position.isCopy);
    }    
    if (e.key === 'r' && selectedCell.mode === "select" && selectedCell.position && !selectedCell.position.isCopy) {
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
          tempMatrix[i][j] = outputSolution[outputIndex][y + i][x + j];
        }
      }
      
      // Rotate 90 degree clockwise and copy to newOutput
      for (let i = 0; i < sx; i++) {
        for (let j = 0; j < sy; j++) {
          newOutput[outputIndex][y + i][x + j] = tempMatrix[sy - 1 - j][i];
        }
      }
      handleChangeOutputSolution(newOutput);
      const newStep: RotateStep = {
        action: 'rotate',
        matrixIndex: outputIndex,
        options: {
          position: { x, y },
          size: { width: sx, height: sy },
        },
        newOutput
      };
      setStep([...step, newStep]);
    }
    // flip the selected area horizontally
    if (e.key === 'h' && selectedCell.mode === "select" && selectedCell.position && !selectedCell.position.isCopy) {
      const { x, y, sx, sy } = selectedCell.position;
      const newOutput = cloneDeep(outputSolution);
      // Create a temporary matrix to hold the flipped values
      const tempMatrix = Array.from({ length: sx }, () => Array.from({ length: sy }, () => "-1" as DIGIT ));
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
        matrixIndex: outputIndex,
        options: {
          position: { x, y },
          size: { width: sx, height: sy },
          direction: 'horizontal'
        },
        newOutput
      };
      setStep([...step, newStep]);
    }
    // flip the selected area vertically
    if (e.key === 'v' && selectedCell.mode === "select" && selectedCell.position && !selectedCell.position.isCopy) {
      const { x, y, sx, sy } = selectedCell.position;
      const newOutput = cloneDeep(outputSolution);
      // Create a temporary matrix to hold the flipped values
      const tempMatrix = Array.from({ length: sx }, () => Array.from({ length: sy }, () => "-1" as DIGIT ));
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
        matrixIndex: outputIndex,
        options: {
          position: { x, y },
          size: { width: sx, height: sy },
          direction: 'vertical'
        },
        newOutput
      };
      setStep([...step, newStep]);
    }
    // project the selected area up, down, left, right
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedCell.mode === "select" && selectedCell.position && !selectedCell.position.isCopy) {
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
          matrixIndex: outputIndex,
          options: {
            position: { x, y },
            size: { width: sx, height: sy },
            direction
          },
          newOutput
        };
        setStep([...step, newStep]);
      }
    }
    // force project the selected area up, down, left, right, using project-pen
    if (isCtrlOrCmd && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedCell.mode === "select" && selectedCell.position && !selectedCell.position.isCopy) {
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
          matrixIndex: outputIndex,
          options: {
            position: { x, y },
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
    // useEffect(() => {
    //   if (selectedCell.mode !== "select") {
    //     setCurrentPosition(null);
    //     setStartPosition(null);
    //     setEndPosition(null);
    //   }
    // }, [selectedCell.mode]);

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
                setStartPosition({ x: j, y: i })
                setCurrentPosition(null)
                setEndPosition(null) 
              }}}
              onMouseUp={() => { if (selectedCell.mode === "select") {
                setEndPosition({ x: j, y: i })
                if (startPosition) {
                  const x = Math.min(startPosition.x, j);
                  const y = Math.min(startPosition.y, i);
                  const sx = Math.abs(startPosition.x - j) + 1;
                  const sy = Math.abs(startPosition.y - i) + 1;
                  if (startPosition.x != j && startPosition.y != i) {
                    handleChangeSelectedCell({...selectedCell, position: { x, y, sx, sy, source: 'output', matrixIndex: outputIndex, isCopy: false } });
                  }
              }}}}
              onMouseOver={() => { if (startPosition && !endPosition) setCurrentPosition({ x: j, y: i }) }}
              opacity={!selectedCell.position?.isCopy && selectedCell.position?.source === 'output' && startPosition && currentPosition && isBetweenPosition(startPosition, currentPosition, { x: j, y: i }) ? 0.5 : 1}
            />
          ))
        )}
      </Layer>
    </Stage>
  );
}


