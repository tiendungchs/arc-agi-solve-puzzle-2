import { useContext, useEffect, useState } from "react";
import { AppContext, type AppContextProps } from "../Context/AppContext";
import { Layer, Rect, Stage } from "react-konva";
import { COLOR_MAP, UNIT } from "../../const";
import { type Position } from "../../types/position";
import { isBetweenPosition } from "../../utils/isBetween";
import { cloneDeep } from "lodash"
import { boundaryFill } from "../../utils/boundaryFill";
import type { CopyStep, FillStep } from "../../types/step";

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
      setStep([...step, newStep]);
    }
  }

  useEffect(() => {
      window.addEventListener('keydown', handleChangeInput);
      return () => {
        window.removeEventListener('keydown', handleChangeInput);
      };
    }, [startPosition, endPosition]);
  
    useEffect(() => {
      if (selectedCell.mode !== "select") {
        setCurrentPosition(null);
        setStartPosition(null);
        setEndPosition(null);
      }
    }, [selectedCell.mode]);

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
              fill={COLOR_MAP[cell] || "#ffffff"}
              stroke="#000000"
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
              opacity={!selectedCell.position?.isCopy && startPosition && currentPosition && isBetweenPosition(startPosition, currentPosition, { x: j, y: i }) ? 0.5 : 1}
            />
          ))
        )}
      </Layer>
    </Stage>
  );
}
