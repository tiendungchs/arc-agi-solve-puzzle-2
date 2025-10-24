import { useContext, useEffect } from "react";
import { AppContext, type AppContextProps } from "../Context/AppContext";
import { Layer, Rect, Stage } from "react-konva";
import { COLOR_MAP, DEFAULT_SELECTED_CELL, UNIT, type DIGIT } from "../../const";
import { isBetweenPosition } from "../../utils/isBetween";
import { cloneDeep } from "lodash"
import { boundaryFill } from "../../utils/boundaryFill";
import { projectRect } from "../../utils/projectRect";
import { type Step, DEFAULT_STEP } from "../../types/step";
import { projectLine } from "../../utils/projectLine";

export default function SolutionOutput() {

  const {chosenMatrix, trainingData, selectedPos, setSelectedPos, startPosition, setStartPosition, currentPosition, setCurrentPosition, endPosition, setEndPosition, outputSolution, selectedCell, handleChangeOutputSolution, handleChangeSelectedCell, inputSolution, step, setStep, choosenTrainingId } = useContext<AppContextProps>(AppContext);
  const rows = outputSolution.length;
  const cols = outputSolution[0].length;


  const handleOnClick = (i: number, j: number) => {
    // Handle cell click
    setSelectedPos({x: j, y: i, source: 'output'});
    if (selectedCell.mode === "edit") {
      const newOutputSolution = cloneDeep(outputSolution);
      const targetColor = newOutputSolution[i][j];
      newOutputSolution[i][j] = selectedCell.color;
      handleChangeOutputSolution(newOutputSolution);
      const newStep: Step = cloneDeep(DEFAULT_STEP);
      newStep.action = 'fill';
      newStep.position = {x: j, y: i, source: 'output'};
      newStep.fromPosition = {x: j, y: i, source: 'output'};
      newStep.color = selectedCell.color;
      newStep.targetColor = targetColor;
      newStep.newOutput = newOutputSolution;
      newStep.isFillAll = false;
      setStep([...step, newStep]);
    }
    else if (selectedCell.mode === "fill") {
      const newOutputSolution = cloneDeep(outputSolution);
      const targetColor = newOutputSolution[i][j];
      boundaryFill(j, i, targetColor, selectedCell.color, newOutputSolution);
      handleChangeOutputSolution(newOutputSolution);
      const newStep: Step = cloneDeep(DEFAULT_STEP);
      newStep.action = 'fill-boundary';
      newStep.position = { x: j, y: i, source: 'output'};
      newStep.fromPosition = { x: j, y: i, source: 'output' };
      newStep.size = { width: 1, height: 1 };
      newStep.color = selectedCell.color;
      newStep.targetColor = targetColor;
      newStep.isFillAll = false;
      newStep.newOutput = newOutputSolution;
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
    if (isCtrlOrCmd && e.key === 'c' && selectedCell.mode === "select" && !selectedCell.isCopied && selectedCell.position && selectedCell.position.source === 'output' && selectedCell.position) {
      const { x, y, source } = selectedCell.position;
      const sx = selectedCell.size ? selectedCell.size.width : 1;
      const sy = selectedCell.size ? selectedCell.size.height : 1;
      handleChangeSelectedCell({...selectedCell, position: { x, y, source }, size: { width: sx, height: sy }, isCopied: true });
    }
    if (isCtrlOrCmd && e.key === 'v' && selectedCell.mode === "select" && selectedPos && selectedPos.source === 'output' && selectedCell.position && selectedCell.isCopied) {
      // Handle paste operation
      setStartPosition(cloneDeep(selectedPos));
      const newOutput = cloneDeep(outputSolution);
      const newRows = newOutput.length;
      const newCols = newOutput[0].length;
      const { x, y, source } = selectedCell.position;
      const sx = selectedCell.size ? selectedCell.size.width : 1;
      const sy = selectedCell.size ? selectedCell.size.height : 1;

      if (source === 'output') {
        const minDeltaRows = Math.min(sy, newRows - selectedPos.y);
        const minDeltaCols = Math.min(sx, newCols - selectedPos.x);
        for (let i = 0; i < minDeltaRows; i++) {
          for (let j = 0; j < minDeltaCols; j++) {
            newOutput[selectedPos.y + i][selectedPos.x + j] = outputSolution[y + i][x + j];
          }
        }
        // The new selectedCell is now the newly pasted area
        handleChangeSelectedCell({...selectedCell, position: { x: selectedPos.x, y: selectedPos.y, source: 'output'}, size: { width: minDeltaCols, height: minDeltaRows }, isCopied: false });
        setEndPosition({ x: selectedPos.x + minDeltaCols - 1, y: selectedPos.y + minDeltaRows - 1, source: 'output'});
      }
      if (!chosenMatrix) {
        return;
      }
      if (chosenMatrix.matrix === 'test' && inputSolution) {
        const matrixIndex = chosenMatrix.index;
        const minDeltaRows = Math.min(sy, newRows - selectedPos.y);
        const minDeltaCols = Math.min(sx, newCols - selectedPos.x);
        for (let i = 0; i < minDeltaRows; i++) {
          for (let j = 0; j < minDeltaCols; j++) {
            newOutput[selectedPos.y + i][selectedPos.x + j] = inputSolution[matrixIndex][y + i][x + j];
          }
        }
        // The new selectedCell is now the newly pasted area
        handleChangeSelectedCell({...selectedCell, position: { x: selectedPos.x, y: selectedPos.y, source: 'output'}, size: { width: minDeltaCols, height: minDeltaRows }, isCopied: false });
        setEndPosition({ x: selectedPos.x + minDeltaCols - 1, y: selectedPos.y + minDeltaRows - 1, source: 'output' });
      }
      else if (chosenMatrix.matrix === 'example' && trainingData) {
        const examples = trainingData?.[choosenTrainingId!].train || [];
        const matrixIndex = chosenMatrix.index;
        const minDeltaRows = Math.min(sy, newRows - selectedPos.y);
        const minDeltaCols = Math.min(sx, newCols - selectedPos.x);
        for (let i = 0; i < minDeltaRows; i++) {
          for (let j = 0; j < minDeltaCols; j++) {
            newOutput[selectedPos.y + i][selectedPos.x + j] = examples[matrixIndex].input[y + i][x + j];
          }
        }
        // The new selectedCell is now the newly pasted area
        handleChangeSelectedCell({...selectedCell, position: { x: selectedPos.x, y: selectedPos.y, source: 'output'}, size: { width: minDeltaCols, height: minDeltaRows }, isCopied: false });
        setEndPosition({ x: selectedPos.x + minDeltaCols - 1, y: selectedPos.y + minDeltaRows - 1, source: 'output' });
      }

      const newStep: Step = cloneDeep(DEFAULT_STEP);
      newStep.action = 'copy';
      newStep.fromPosition = { x, y, source};
      newStep.position = { x: selectedPos.x, y: selectedPos.y, source: 'output' };
      newStep.size = { width: sx, height: sy };
      newStep.newOutput = cloneDeep(newOutput);
      handleChangeOutputSolution(newOutput);
      setStep([...step, newStep]);
    }

    // Match the selected area to the destination area
    // shift+Ctrl+m
    // TODO: improve the logic to handle overlapping area
    if (e.key === 'm' && selectedCell.mode === "select" && selectedPos && selectedCell.position && selectedCell.isCopied) {
      // Handle paste operation
      setStartPosition(cloneDeep(selectedPos));
      const newOutput = cloneDeep(outputSolution);
      const newRows = newOutput.length;
      const newCols = newOutput[0].length;
      const { x, y, source } = selectedCell.position;
      const sx = selectedCell.size ? selectedCell.size.width : 1;
      const sy = selectedCell.size ? selectedCell.size.height : 1;

      if (source === 'output') {
        const minDeltaRows = Math.min(sy, newRows - selectedPos.y);
        const minDeltaCols = Math.min(sx, newCols - selectedPos.x);
        for (let i = 0; i < minDeltaRows; i++) {
          for (let j = 0; j < minDeltaCols; j++) {
            newOutput[selectedPos.y + i][selectedPos.x + j] = (newOutput[selectedPos.y + i][selectedPos.x + j] === outputSolution[y + i][x + j])? outputSolution[y + i][x + j] : -1 as DIGIT;
          }
        }
        // The new selectedCell is now the newly pasted area
        handleChangeSelectedCell({...selectedCell, position: { x: selectedPos.x, y: selectedPos.y, source: 'output'}, size: { width: minDeltaCols, height: minDeltaRows }, isCopied: false });
        setEndPosition({ x: selectedPos.x + minDeltaCols - 1, y: selectedPos.y + minDeltaRows - 1, source: 'output'});
      }
      if (!chosenMatrix) {
        return;
      }
      const matrixIndex = chosenMatrix.index;
      if (chosenMatrix.matrix === 'test' && inputSolution) {
        const minDeltaRows = Math.min(sy, newRows - selectedPos.y);
        const minDeltaCols = Math.min(sx, newCols - selectedPos.x);
        for (let i = 0; i < minDeltaRows; i++) {
          for (let j = 0; j < minDeltaCols; j++) {
            newOutput[selectedPos.y + i][selectedPos.x + j] = (newOutput[selectedPos.y + i][selectedPos.x + j] === inputSolution[matrixIndex][y + i][x + j])? inputSolution[matrixIndex][y + i][x + j] : -1 as DIGIT;
          }
        }
        // The new selectedCell is now the newly pasted area
        handleChangeSelectedCell({...selectedCell, position: { x: selectedPos.x, y: selectedPos.y, source: 'output'}, size: { width: minDeltaCols, height: minDeltaRows }, isCopied: false });
        setEndPosition({ x: selectedPos.x + minDeltaCols - 1, y: selectedPos.y + minDeltaRows - 1, source: 'output'});
      }
      else if (chosenMatrix.matrix === 'example' && trainingData) {
        const examples = trainingData?.[choosenTrainingId!].train || [];
        const minDeltaRows = Math.min(sy, newRows - selectedPos.y);
        const minDeltaCols = Math.min(sx, newCols - selectedPos.x);
        for (let i = 0; i < minDeltaRows; i++) {
          for (let j = 0; j < minDeltaCols; j++) {
            newOutput[selectedPos.y + i][selectedPos.x + j] = (newOutput[selectedPos.y + i][selectedPos.x + j] === examples[matrixIndex].input[y + i][x + j])? examples[matrixIndex].input[y + i][x + j] : -1 as DIGIT;
          }
        }
        // The new selectedCell is now the newly pasted area
        handleChangeSelectedCell({...selectedCell, position: { x: selectedPos.x, y: selectedPos.y, source: 'output' }, size: { width: minDeltaCols, height: minDeltaRows }, isCopied: false });
        setEndPosition({ x: selectedPos.x + minDeltaCols - 1, y: selectedPos.y + minDeltaRows - 1, source: 'output' });
      }

      const newStep: Step = cloneDeep(DEFAULT_STEP);
      newStep.action = 'match';
      newStep.fromPosition = { x, y, source};
      newStep.position = { x: selectedPos.x, y: selectedPos.y, source: 'output' };
      newStep.size = { width: sx, height: sy };
      newStep.newOutput = cloneDeep(newOutput);
      handleChangeOutputSolution(newOutput);
      setStep([...step, newStep]);
    }

    // scale (re-scale) the selected area, scale factor 2x: 2, scale factor 3: 3
    if ((e.key === '2' || e.key === '3') && selectedCell.mode === "select" && selectedCell.position && selectedCell.position.source === 'output' && !selectedCell.isCopied) {
      const scaleFactor = parseInt(e.key);
      const { x, y } = selectedCell.position;
      const sx = selectedCell.size?.width || 1;
      const sy = selectedCell.size?.height || 1;
      const newRows = sy * scaleFactor;
      const newCols = sx * scaleFactor;
      const minDeltaCols = Math.min(newCols, cols - x);
      const minDeltaRows = Math.min(newRows, rows - y);
      const newOutput = cloneDeep(outputSolution);
      for (let i = 0; i < minDeltaRows; i++) {
        for (let j = 0; j < minDeltaCols; j++) {
          newOutput[y + i][x + j] = outputSolution[y + Math.floor(i / scaleFactor)][x + Math.floor(j / scaleFactor)];
        }
      }
      const newStep: Step = cloneDeep(DEFAULT_STEP);
      newStep.action = 're-scale';
      newStep.fromPosition = { x, y, source: 'output' };
      newStep.position = { x, y, source: 'output' };
      newStep.size = { width: sx, height: sy };
      newStep.scaleFactor = scaleFactor;
      newStep.newOutput = cloneDeep(newOutput);
      handleChangeOutputSolution(newOutput);
      setStep([...step, newStep]);
    }

    if (e.key === 'r' && selectedCell.mode === "select" && selectedCell.position && selectedCell.position.source === 'output' && !selectedCell.isCopied) {
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
          tempMatrix[i][j] = outputSolution[y + i][x + j];
        }
      }
      
      // Rotate 90 degree clockwise and copy to newOutput
      for (let i = 0; i < sx; i++) {
        for (let j = 0; j < sx; j++) {
          newOutput[y + i][x + j] = tempMatrix[sy - 1 - j][i];
        }
      }
      handleChangeOutputSolution(newOutput);
      const newStep: Step = cloneDeep(DEFAULT_STEP);
      newStep.action = 'rotate';
      newStep.position = { x, y, source: 'output' };
      newStep.fromPosition = { x, y, source: 'output' };
      newStep.size = { width: sx, height: sy };
      newStep.newOutput = cloneDeep(newOutput);
      setStep([...step, newStep]);
    }
    // flip the selected area horizontally
    if (e.key === 'h' && selectedCell.mode === "select" && selectedCell.position && selectedCell.position.source === 'output' && !selectedCell.isCopied) {
      const { x, y } = selectedCell.position;
      const sx = selectedCell.size?.width || 1;
      const sy = selectedCell.size?.height || 1;
      const newOutput = cloneDeep(outputSolution);
      // Create a temporary matrix to hold the flipped values
      const tempMatrix = Array.from({ length: sy }, () => Array.from({ length: sx }, () => 0 as DIGIT ));
      for (let i = 0; i < sy; i++) {
        for (let j = 0; j < sx; j++) {
          tempMatrix[i][j] = outputSolution[y + i][x + j];
        }
      }
      // Flip horizontally and copy to newOutput
      for (let i = 0; i < sy; i++) {
        for (let j = 0; j < sx; j++) {
          newOutput[y + i][x + j] = tempMatrix[i][sx - 1 - j];
        }
      }
      handleChangeOutputSolution(newOutput);
      const newStep: Step = cloneDeep(DEFAULT_STEP);
      newStep.action = 'flip';
      newStep.position = { x, y, source: 'output' };
      newStep.fromPosition = { x, y, source: 'output' };
      newStep.size = { width: sx, height: sy };
      newStep.direction = 'horizontal';
      newStep.newOutput = cloneDeep(newOutput);
      setStep([...step, newStep]);
    }
    // flip the selected area vertically
    if (!isCtrlOrCmd && e.key === 'v' && selectedCell.mode === "select" && selectedCell.position && selectedCell.position.source === 'output' && !selectedCell.isCopied) {
      const { x, y } = selectedCell.position;
      const sx = selectedCell.size?.width || 1;
      const sy = selectedCell.size?.height || 1;
      const newOutput = cloneDeep(outputSolution);
      // Create a temporary matrix to hold the flipped values
      const tempMatrix = Array.from({ length: sy }, () => Array.from({ length: sx }, () => 0 as DIGIT ));
      for (let i = 0; i < sy; i++) {
        for (let j = 0; j < sx; j++) {
          tempMatrix[i][j] = outputSolution[y + i][x + j];
        }
      }
      
      // Flip vertically and copy to newOutput
      for (let i = 0; i < sy; i++) {
        for (let j = 0; j < sx; j++) {
          newOutput[y + i][x + j] = tempMatrix[sy - 1 - i][j];
        }
      }

      handleChangeOutputSolution(newOutput);
      const newStep: Step = cloneDeep(DEFAULT_STEP);
      newStep.action = 'flip';
      newStep.position = { x, y, source: 'output' };
      newStep.fromPosition = { x, y, source: 'output' };
      newStep.size = { width: sx, height: sy };
      newStep.direction = 'vertical';
      newStep.newOutput = cloneDeep(newOutput);
      setStep([...step, newStep]);
    }
    // project the selected area up, down, left, right
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedCell.mode === "select" && selectedCell.position && selectedCell.position.source === 'output' && !selectedCell.isCopied) {
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
            tempMatrix[i][j] = newOutput[y + i][x + j];
          }
        }
        projectRect(tempMatrix, direction);
        // copy the projected tempMatrix back to newOutput
        for (let i = 0; i < sy; i++) {
          for (let j = 0; j < sx; j++) {
            newOutput[y + i][x + j] = tempMatrix[i][j];
          }
        }
        handleChangeOutputSolution(newOutput);
        const newStep: Step = cloneDeep(DEFAULT_STEP);
        newStep.action = 'project';
        newStep.position = { x, y, source: 'output' };
        newStep.fromPosition = { x, y, source: 'output' };
        newStep.size = { width: sx, height: sy };
        newStep.direction = direction;
        newStep.newOutput = cloneDeep(newOutput);
        setStep([...step, newStep]);
      }
    }
    // check if conition
    // diagonally project the selected line up-right, down-left, up-left, down-right (north, south, east, west)
    if (['n', 's', 'e', 'w'].includes(e.key) && selectedCell.mode === "select" && selectedCell.position && selectedCell.position.source === 'output' && !selectedCell.isCopied && selectedCell.size && (selectedCell.size.width === 1 || selectedCell.size.height === 1)) {
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
        projectLine(newOutput, {x, y}, {width: sx, height: sy}, direction);
        handleChangeOutputSolution(newOutput);
        const newStep: Step = cloneDeep(DEFAULT_STEP);
        newStep.action = 'project';
        newStep.position = { x, y, source: 'output' };
        newStep.fromPosition = { x, y, source: 'output' };
        newStep.size = { width: sx, height: sy };
        newStep.direction = direction;
        newStep.newOutput = cloneDeep(newOutput);
        setStep([...step, newStep]);
      }
    }

    // // force project the selected area up, down, left, right, using project-pen
    // if (isCtrlOrCmd && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedCell.mode === "select" && selectedCell.position && !selectedCell.isCopied) {
    //   const directionMap: { [key: string]: 'up' | 'down' | 'left' | 'right' } = {
    //     'ArrowUp': 'up',
    //     'ArrowDown': 'down',
    //     'ArrowLeft': 'left',
    //     'ArrowRight': 'right'
    //   };
    //   const direction = directionMap[e.key];
    //   if (direction) {
    //     const { x, y } = selectedCell.position;
    //     const sx = selectedCell.size?.width || 1;
    //     const sy = selectedCell.size?.height || 1;
    //     // Rect = selected area, a temp matrix to hold the area to be projected
    //     const newOutput = cloneDeep(outputSolution);
    //     const tempMatrix = Array.from({ length: sy }, () => Array.from({ length: sx }, () => 0 as DIGIT));
    //     for (let i = 0; i < sy; i++) {
    //       for (let j = 0; j < sx; j++) {
    //         tempMatrix[i][j] = newOutput[outputIndex][y + i][x + j];
    //       }
    //     }
    //     projectRectForce(tempMatrix, direction);
    //     // copy the projected tempMatrix back to newOutput
    //     for (let i = 0; i < sy; i++) {
    //       for (let j = 0; j < sx; j++) {
    //         newOutput[outputIndex][y + i][x + j] = tempMatrix[i][j];
    //       }
    //     }
    //     handleChangeOutputSolution(newOutput);
    //     const newStep: ProjectStep = {
    //       action: 'project-force',
    //       options: {
    //         position: { x, y, source: 'output', matrixIndex: outputIndex },
    //         size: { width: sx, height: sy },
    //         direction
    //       },
    //       newOutput
    //     };
    //     setStep([...step, newStep]);
    //   }
    // }
  }

  useEffect(() => {
      window.addEventListener('keydown', handleChangeInput);
      return () => {
        window.removeEventListener('keydown', handleChangeInput);
      };
  }, [startPosition, endPosition, selectedCell, outputSolution, step]);  
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
        {outputSolution.map((row, i) =>
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
                setStartPosition({ x: j, y: i, source: 'output'})
                setCurrentPosition(null)
                setEndPosition(null) 
              }}}
              onMouseUp={() => { if (selectedCell.mode === "select") {
                setEndPosition({ x: j, y: i, source: 'output'})
                if (startPosition) {
                  const x = Math.min(startPosition.x, j);
                  const y = Math.min(startPosition.y, i);
                  const sx = Math.abs(startPosition.x - j) + 1;
                  const sy = Math.abs(startPosition.y - i) + 1;
                  if ((startPosition.x != j || startPosition.y != i) && startPosition.source === 'output') {
                    handleChangeSelectedCell({...selectedCell, position: { x, y, source: 'output' }, size: { width: sx, height: sy }, isCopied: false });
                  }
              }}}}
              onMouseOver={() => { if (startPosition && !endPosition) setCurrentPosition({ x: j, y: i, source: 'output' }) }}
              opacity={!selectedCell?.isCopied && selectedCell.position?.source === 'output' && startPosition && ( currentPosition && isBetweenPosition(startPosition, currentPosition, { x: j, y: i, source: 'output' }) || endPosition && isBetweenPosition(startPosition, endPosition, { x: j, y: i, source: 'output' })) ? 0.5 : 1}
            />
          ))
        )}
      </Layer>
    </Stage>
  );
}