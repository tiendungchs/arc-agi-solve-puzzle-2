import { Box, Button, TextField, Typography } from "@mui/material";
import { useContext, useState } from "react";
import { AppContext, type AppContextProps } from "../Context/AppContext";
import { DEFAULT_SOLUTION, type DIGIT } from "../../const";
import { cloneDeep } from "lodash";
import type { ClearStep, CopyStep, ResizeStep } from "../../types/step";


export default function ResizeInput() {
  const { outputSolution, setOutputSolution, inputSolution, setStep, step, currentOutputIndex, setCurrentOutputIndex, redoStep, setRedoStep } = useContext<AppContextProps>(AppContext);
  const rows = outputSolution[currentOutputIndex].length;
  const cols = outputSolution[currentOutputIndex][0].length;
  const [size, setSize] = useState<string>(`${cols}x${rows}`);
  const [error, setError] = useState<string | null>(null);

  const handleChangeSize = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSize(event.target.value);
  };

  const handleValidateSize = (size: string) => {
    const [newCols, newRows] = size.split("x").map(Number);
    if (isNaN(newCols) || isNaN(newRows)) {
      setError("Invalid size format. Please use <cols>x<rows>.");
    } else if (newCols < 1 || newCols > 30 || newRows < 1 || newRows > 30) {
      setError("Invalid size. Size must be between 1x1 and 30x30.");
    } else {
      setError(null);
    }

    const newOutput: Array<Array<DIGIT>> = Array.from({ length: newRows }, (_, _i) => Array.from({ length: newCols }, (_, _j) => "-1" as DIGIT ));
    const oldRows = outputSolution.length;
    const oldCols = outputSolution[0].length;

    const minRows = Math.min(oldRows, newRows);
    const minCols = Math.min(oldCols, newCols);

    for (let i = 0; i < minRows; i++) {
      for (let j = 0; j < minCols; j++) {
        newOutput[i][j] = outputSolution[currentOutputIndex][i][j];
      }
    }

    outputSolution[currentOutputIndex] = newOutput;

    setOutputSolution(outputSolution);
    const newStep: ResizeStep = {
      action: 'resize',
      options: {
        z: currentOutputIndex,
        size: { width: newCols, height: newRows },
      },
      newOutput: outputSolution
    };
    setStep([...step, newStep]);
  }

  const handleCopyFromInput = () => {
    // Implement copy from input logic
    if (inputSolution) {
      const newOutput = cloneDeep(inputSolution);
      outputSolution[currentOutputIndex] = newOutput;
      const newStep: CopyStep = {
        action: 'copy',
        options: {
          from: {
            source: 'input',
            position: { x: 0, y: 0 },
            size: { width: newOutput[0].length, height: newOutput.length },
          },
          to: {
            position: { x: 0, y: 0 }
          }
        },
        newOutput: outputSolution
      };
      setOutputSolution(outputSolution);
      setStep([...step, newStep]);
      setSize(`${newOutput[0].length}x${newOutput.length}`);
    }
  }

  const handleClear = () => {
    const newOutput: Array<Array<DIGIT>> = Array.from({ length: rows }, (_, _i) => Array.from({ length: cols }, (_, _j) => "-1" as DIGIT ));
    outputSolution[currentOutputIndex] = newOutput;
    const newStep: ClearStep = {
      action: 'clear',
      options: {
        z: currentOutputIndex,
        size: { width: cols, height: rows },
      },
      newOutput: outputSolution
    }
    setStep([...step, newStep]);
    setOutputSolution(outputSolution);
  }

  const handleReset = () => {
    setOutputSolution([DEFAULT_SOLUTION]);
    setCurrentOutputIndex(0);
    setStep([]);
  }

  const handleAddMoreOutput = () => {
    setOutputSolution([...outputSolution, DEFAULT_SOLUTION]);
  }

  const handleUndo = () => {
    const popStep = step.pop();
    if (popStep) {
      setRedoStep([popStep, ...redoStep]);
    }

    const lastStep = step[step.length - 1];
    const newOutput = lastStep ? lastStep.newOutput : [DEFAULT_SOLUTION];
    setOutputSolution(newOutput);
    setStep(step);
  }

  const handleRedo = () => {
    const popStep = redoStep.shift();
    if (popStep) {
      setStep([...step, popStep]);
      setOutputSolution(popStep.newOutput);
      setRedoStep(redoStep);
    }
  }

  return (
    <Box>
      <Typography variant="h6" marginBottom={1}>1. Configure your output grid:</Typography>
      <Box display='flex' justifyContent='space-between'>
        <Box display='flex' flexDirection='column'>
          <Box display='flex' flexDirection='row'>
            <TextField value={size} onChange={handleChangeSize} variant="outlined" size="small" />
            <Button variant="contained" size="small" sx={{ marginLeft: 2 }} onClick={() => handleValidateSize(size)}>Resize</Button>
          </Box>
          {error && <Typography color="error" variant="caption">{error}</Typography>}
        </Box>
        <Box display='flex' flexDirection='row' maxWidth='60%' flexWrap='wrap' gap={1}>
          <Button variant="contained" size="small" sx={{ marginRight: 1 }} onClick={handleAddMoreOutput}>Add More Output</Button>
          <Button variant="contained" size="small" sx={{ marginRight: 1 }} onClick={handleCopyFromInput}>Copy from input</Button>
          <Button variant="contained" size="small" sx={{ marginRight: 1 }} onClick={handleClear}>Clear</Button>
          <Button variant="contained" size="small" sx={{ marginRight: 1 }} onClick={handleReset}>Reset</Button>
          <Button variant="contained" size="small" sx={{ marginRight: 1 }} onClick={handleUndo}>Undo</Button>
          <Button variant="contained" size="small" onClick={handleRedo}>Redo</Button>
        </Box>
      </Box>
    </Box>
  );
}
