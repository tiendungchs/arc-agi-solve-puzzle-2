import { Box, Button, Typography } from "@mui/material";
import { COLOR_MAP, type DIGIT } from "../../const";
import { useContext } from "react";
import { AppContext, type AppContextProps } from "../Context/AppContext";
import type { FillStep } from "../../types/step";


export default function EditOutputGridCell() {

  const { selectedCell, handleChangeSelectedCell, setOutputSolution, outputSolution, step, setStep, currentOutputIndex } = useContext<AppContextProps>(AppContext);

  const handleClick = (index: DIGIT) => {
    if (selectedCell.mode === "select" && selectedCell.position) {
      const { x, y, sx, sy, source } = selectedCell.position;
      if (source === "output") {
        for (let i = x; i < x + sx; i++) {
          for (let j = y; j < y + sy; j++) {
            outputSolution[currentOutputIndex][j][i] = index;
          }
        }
        const newStep: FillStep = {
          action: 'fill',
          options: {
            position: { x, y, z: currentOutputIndex },
            size: { width: sx, height: sy },
            color: index
          },
          newOutput: outputSolution
        };
        setStep([...step, newStep]);
        setOutputSolution(outputSolution);
      }
    }
    handleChangeSelectedCell({ ...selectedCell, color: index });
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
        {Array.from({ length: 10 }, (_, index) => (
          <Box key={index} marginRight={0.5} onClick={() => handleClick(index as DIGIT)} sx={{ cursor: "pointer", border: selectedCell.color === index ? "2px solid #000000" : "2px solid transparent", borderRadius: 1 }}>
            <Box width={32} height={32} bgcolor={COLOR_MAP[index as DIGIT]} position="relative" />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
