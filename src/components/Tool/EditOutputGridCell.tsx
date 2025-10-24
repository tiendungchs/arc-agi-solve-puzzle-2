import { Box, Button, Checkbox, Typography } from "@mui/material";
import { COLOR_MAP, type DIGIT } from "../../const";
import { useContext, useState } from "react";
import { AppContext, type AppContextProps } from "../Context/AppContext";
import { DEFAULT_STEP, type Step } from "../../types/step";
import { cloneDeep } from "lodash";


export default function EditOutputGridCell() {

  const { selectedCell, handleChangeSelectedCell, handleChangeOutputSolution, outputSolution, step, setStep } = useContext<AppContextProps>(AppContext);
  const [targetColor, setTargetColor] = useState<DIGIT | 0>(0);
  const [isFillAll, setIsFillAll] = useState<boolean>(false);
  const INDEX_DIGIT_MAP: Record<number, DIGIT> = {
    10: -1 as DIGIT,
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
  };
  const handleClick = (color: DIGIT) => {
    // fill an area, replace targetColor with color
    if (selectedCell.mode === "select" && selectedCell.position && selectedCell.position.source === "output") {
      const newOutputSolution = cloneDeep(outputSolution);
      const { x, y } = selectedCell.position;
      const sx = selectedCell.size?.width || 1;
      const sy = selectedCell.size?.height || 1;
      for (let i = x; i < x + sx; i++) {
        for (let j = y; j < y + sy; j++) {
          if (newOutputSolution[j][i] !== targetColor && !isFillAll) {
            continue;
          }
          newOutputSolution[j][i] = color;
        }
      }
      const newStep: Step = cloneDeep(DEFAULT_STEP);
      newStep.action = 'fill';
      newStep.color = color;
      newStep.targetColor = targetColor;
      newStep.isFillAll = isFillAll;
      newStep.position = { x, y, source: 'output' };
      newStep.fromPosition = { x, y, source: 'output' };
      newStep.size = { width: sx, height: sy };
      newStep.newOutput = cloneDeep(newOutputSolution);

      setStep([...step, newStep]);
      handleChangeOutputSolution(newOutputSolution);
    }
    handleChangeSelectedCell({ ...selectedCell, color });
  }

  return (
    <Box>
      <Typography variant="h6" marginBottom={1}>2. Edit your output grid cells:</Typography>
      <Box display="flex" flexDirection="row" marginBottom={2}>
        <Button variant="contained" size="small" sx={{ marginRight: 1 }} onClick={() => handleChangeSelectedCell({ ...selectedCell, mode: "edit", position: undefined })} color={selectedCell.mode === "edit" ? "primary" : "inherit"}>Edit</Button>
        <Button variant="contained" size="small" sx={{ marginRight: 1 }} onClick={() => handleChangeSelectedCell({ ...selectedCell, mode: "select" })} color={selectedCell.mode === "select" ? "primary" : "inherit"}>Select</Button>
        <Button variant="contained" size="small" sx={{ marginRight: 1 }} onClick={() => handleChangeSelectedCell({ ...selectedCell, mode: "fill", position: undefined })} color={selectedCell.mode === "fill" ? "primary" : "inherit"}>Fill</Button>
      </Box>
      <Box display="flex" flexDirection="row">
        {Array.from({ length: 11 }, (_, index) => (
          <Box key={index} marginRight={0.5} onClick={() => handleClick(INDEX_DIGIT_MAP[index])} sx={{ cursor: "pointer", border: selectedCell.color === INDEX_DIGIT_MAP[index] ? "2px solid #000000" : "2px solid transparent", borderRadius: 1 }}>
            <Box width={32} height={32} bgcolor={COLOR_MAP[INDEX_DIGIT_MAP[index]]} position="relative" />
          </Box>
        ))}
      </Box>
      <Typography  variant="body2">Target Color:</Typography>
      <Box display="flex" flexDirection="row">
        {Array.from({ length: 11 }, (_, index) => (
          <Box key={index} marginRight={0.5} onClick={() => setTargetColor(INDEX_DIGIT_MAP[index])} sx={{ cursor: "pointer", border: targetColor === INDEX_DIGIT_MAP[index] ? "2px solid #000000" : "2px solid transparent", borderRadius: 1 }}>
            <Box width={32} height={32} bgcolor={COLOR_MAP[INDEX_DIGIT_MAP[index]]} position="relative" sx={{ opacity: 0.6 }} />
          </Box>
        ))}
        <Typography variant="body2">/Replace All Colors:</Typography>
        <Checkbox checked={isFillAll} onChange={(e) => setIsFillAll(e.target.checked)} />
      </Box>
    </Box>
  );
}