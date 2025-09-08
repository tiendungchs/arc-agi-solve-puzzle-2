import { useContext, useEffect, useState } from "react";
import { AppContext, type AppContextProps } from "../Context/AppContext";
import { Layer, Rect, Stage } from "react-konva";
import { COLOR_MAP, UNIT } from "../../const";
import { type Position } from "../../types/position";
import { isBetweenPosition } from "../../utils/isBetween";
import { cloneDeep } from "lodash"
import { boundaryFill } from "../../utils/boundaryFill";
import type { CopyStep, FillStep } from "../../types/step";
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

  const handleChangeInput = (e: KeyboardEvent) => {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    if (isCtrlOrCmd && e.key === 'c' && startPosition && endPosition && selectedCell.mode === "select") {
      const x = Math.min(startPosition.x, endPosition.x);
      const y = Math.min(startPosition.y, endPosition.y);
      const sx = Math.abs(startPosition.x - endPosition.x) + 1;
      const sy = Math.abs(startPosition.y - endPosition.y) + 1;
      handleChangeSelectedCell({...selectedCell, copyPosition: { z: startPosition.z || 0, x, y, sx, sy, source: 'output' } });
    }

    if (isCtrlOrCmd && e.key === 'v' && selectedCell.mode === "select" && selectedPos && selectedCell.copyPosition && selectedCell.copyPosition) {
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
      }
      setOutputSolution(newOutput);
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
    <>
      {outputSolution?.map((solutions, k) => (
        <Box key={k} display="flex" flexDirection='column' marginBottom={2} onClick={() => setCurrentOutputIndex(k)}>
          <Stage width={solutions.length * UNIT} height={solutions[0].length * UNIT}>
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
                    stroke="#000000"
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
