import { Box, Button, TextField, Typography } from "@mui/material";
import { useContext, useState } from "react";
import { AppContext, type AppContextProps } from "../Context/AppContext";
import { DEFAULT_SOLUTION, type DIGIT } from "../../const";
import { cloneDeep } from "lodash";
import type { ClearStep, CopyStep, ResizeStep } from "../../types/step";


export default function ResizeInput() {
  const { outputSolution, handleChangeOutputSolution, inputSolution, setStep, step } = useContext<AppContextProps>(AppContext);
  const rows = outputSolution.length;
  const cols = outputSolution[0].length;
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
        newOutput[i][j] = outputSolution[i][j];
      }
    }

    handleChangeOutputSolution(newOutput);
    const newStep: ResizeStep = {
      action: 'resize',
      options: {
        size: { width: newCols, height: newRows },
      },
      newOutput
    };
    setStep([...step, newStep]);
  }

  const handleCopyFromInput = () => {
    // Implement copy from input logic
    if (inputSolution) {
      const newOutput = cloneDeep(inputSolution);
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
        newOutput
      };
      handleChangeOutputSolution(newOutput);
      setStep([...step, newStep]);
      setSize(`${newOutput[0].length}x${newOutput.length}`);
    }
  }

  const handleClear = () => {
    const newOutput: Array<Array<DIGIT>> = Array.from({ length: rows }, (_, _i) => Array.from({ length: cols }, (_, _j) => "-1" as DIGIT ));
    const newStep: ClearStep = {
      action: 'clear',
      options: {
        size: { width: cols, height: rows },
      },
      newOutput
    }
    setStep([...step, newStep]);
    handleChangeOutputSolution(newOutput);
  }

  const handleReset = () => {
    handleChangeOutputSolution(DEFAULT_SOLUTION);
    setStep([]);
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
        <Box display='flex' flexDirection='row'>
          <Button variant="contained" size="small" sx={{ marginRight: 1 }} onClick={handleCopyFromInput}>Copy from input</Button>
          <Button variant="contained" size="small" sx={{ marginRight: 1 }} onClick={handleClear}>Clear</Button>
          <Button variant="contained" size="small" onClick={handleReset}>Reset</Button>
        </Box>
      </Box>
    </Box>
  );
}
