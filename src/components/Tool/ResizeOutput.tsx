import { Box, Button, TextField, Typography } from "@mui/material";
import { useContext, useState } from "react";
import { AppContext, type AppContextProps } from "../Context/AppContext";
import { DEFAULT_SOLUTION_MATRIX, type DIGIT } from "../../const";
import { cloneDeep } from "lodash";
import type { ClearStep, CopyStep, ResizeStep } from "../../types/step";


export default function ResizeInput({ matrixIndex }: { matrixIndex: number }) {
  const { outputSolution, handleChangeOutputSolution, inputSolution, setStep, step, redoStep, setRedoStep } = useContext<AppContextProps>(AppContext);
  const rows = outputSolution[matrixIndex].length;
  const cols = outputSolution[matrixIndex][0].length;
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

    const newOutputMatrix: Array<Array<DIGIT>> = Array.from({ length: newRows }, (_, _i) => Array.from({ length: newCols }, (_, _j) => 0 as DIGIT ));
    const oldRows = outputSolution[matrixIndex].length;
    const oldCols = outputSolution[matrixIndex][0].length;

    const minRows = Math.min(oldRows, newRows);
    const minCols = Math.min(oldCols, newCols);

    for (let i = 0; i < minRows; i++) {
      for (let j = 0; j < minCols; j++) {
        newOutputMatrix[i][j] = outputSolution[matrixIndex][i][j];
      }
    }
    const newOutput = cloneDeep(outputSolution);
    newOutput[matrixIndex] = newOutputMatrix;

    handleChangeOutputSolution(newOutput);
    const newStep: ResizeStep = {
      action: 'resize',
      matrixIndex,
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
      const newRows = inputSolution[matrixIndex].length;
      const newCols = inputSolution[matrixIndex][0].length;
      const newOutputMatrix1 = Array.from({ length: newRows }, () => Array.from({ length: newCols }, () => 0 as DIGIT )); // create a new empty matrix of size : newRows x newCols
      const newOutput1 = cloneDeep(outputSolution);
      newOutput1[matrixIndex] = newOutputMatrix1;
      //Create a resize step
      const newStep1: ResizeStep = {
        action: 'resize',
        matrixIndex,
        options: {
          size: { width: newCols, height: newRows },
        },
        newOutput: newOutput1
      };

      const newOutputMatrix = cloneDeep(inputSolution[matrixIndex]);
      const newOutput = cloneDeep(outputSolution);
      newOutput[matrixIndex] = newOutputMatrix;
      // Create a copy step
      const newStep: CopyStep = {
        action: 'copy',
        options: {
          from: {
            position: { x: 0, y: 0, source: 'input', matrixIndex },
            size: { width: newCols, height: newRows },
          },
          to: {
            position: { x: 0, y: 0, source: 'output', matrixIndex }
          }
        },
        newOutput 
      };
      
      // Register both steps in the correct order
      setStep([...step, newStep1, newStep]);
      handleChangeOutputSolution(newOutput);
      setSize(`${newCols}x${newRows}`);
    }
  }


  const handleUndo = () => {
    // Create a copy to avoid direct mutation
    const newStep = [...step];
    const popStep = newStep.pop();

    if (popStep) {
      // Update redoStep with the popped item
      setRedoStep([popStep, ...redoStep]);
      
      // Update output with the previous state
      const newOutput = newStep.at(-1)?.newOutput || [DEFAULT_SOLUTION_MATRIX] as Array<Array<Array<DIGIT>>>;
      handleChangeOutputSolution(newOutput);
      
      // Update step with the new array (without the popped item)
      setStep(newStep);
    }
    else {
      const newOutput = cloneDeep([DEFAULT_SOLUTION_MATRIX] as Array<Array<Array<DIGIT>>>);
      handleChangeOutputSolution(newOutput);
      setStep([]);
    }
  }
  
  const handleRedo = () => {
    if (redoStep.length > 0) {
      // Create a copy and get the first item
      const newRedoStep = [...redoStep];
      const popStep = newRedoStep.shift();
      
      if (popStep) {
        // Add the item to step
        setStep([...step, popStep]);
        
        // Update output
        handleChangeOutputSolution(popStep.newOutput);
        
        // Update redoStep without the shifted item
        setRedoStep(newRedoStep);
      }
    }
  }

  const handleClear = () => {
    const newOutputMatrix: Array<Array<DIGIT>> = Array.from({ length: rows }, (_, _i) => Array.from({ length: cols }, (_, _j) => 0 as DIGIT ));
    const newOutput = cloneDeep(outputSolution);
    newOutput[matrixIndex] = newOutputMatrix;
    const newStep: ClearStep = {
      action: 'clear',
      matrixIndex,
      newOutput
    };
    setStep([...step, newStep]);
    handleChangeOutputSolution(newOutput);
  }

  const handleReset = () => { // Reset every output matrix, for minor changes, undo/redo is recommended
    // const newOutputSolution = cloneDeep(outputSolution);
    // newOutputSolution[matrixIndex] = cloneDeep(DEFAULT_SOLUTION_MATRIX);
    const newOutputSolution = Array.from({ length: outputSolution.length || 1 }, () => DEFAULT_SOLUTION_MATRIX);
    handleChangeOutputSolution(newOutputSolution);
    setSize('3x3');
    // setStep([]); //
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
          <Button variant="contained" size="small" sx={{ marginRight: 1 }} onClick={handleReset}>Reset</Button>
          <Button variant="contained" size="small" sx={{ marginRight: 1 }} onClick={handleUndo}>Undo</Button>
          <Button variant="contained" size="small" onClick={handleRedo}>Redo</Button>
        </Box>
      </Box>
    </Box>
  );
}