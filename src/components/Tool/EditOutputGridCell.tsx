import { Box, Button, Typography } from "@mui/material";
import { COLOR_MAP, type DIGIT } from "../../const";
import { useContext } from "react";
import { AppContext, type AppContextProps } from "../Context/AppContext";
import type { FillStep } from "../../types/step";
import { cloneDeep } from "lodash";


export default function EditOutputGridCell({ matrixIndex }: { matrixIndex: number }) {

  const { selectedCell, handleChangeSelectedCell, handleChangeOutputSolution, outputSolution, step, setStep } = useContext<AppContextProps>(AppContext);

  const handleClick = (index: DIGIT, isFillSoft: boolean) => {
    if (selectedCell.mode === "select" && selectedCell.position) {
      const newOutputSolution = cloneDeep(outputSolution);
      const { x, y, source } = selectedCell.position;
      const sx = selectedCell.size?.width || 1;
      const sy = selectedCell.size?.height || 1;
      if (source === "output") {
        for (let i = x; i < x + sx; i++) {
          for (let j = y; j < y + sy; j++) {
            newOutputSolution[matrixIndex][j][i] = (newOutputSolution[matrixIndex][j][i] === 0 && isFillSoft) ? 0 : index;
          }
        }
        const newStep: FillStep = {
          action: 'fill',
          options: {
            position: { x, y, source: 'output', matrixIndex },
            size: {width: sx, height: sy},
            color: index
          },
          newOutput: newOutputSolution
        };
        setStep([...step, newStep]);
        handleChangeOutputSolution(newOutputSolution);
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
          <Box key={index} marginRight={0.5} onClick={() => handleClick(index as DIGIT, false)} sx={{ cursor: "pointer", border: selectedCell.color === index ? "2px solid #000000" : "2px solid transparent", borderRadius: 1 }}>
            <Box width={32} height={32} bgcolor={COLOR_MAP[index as DIGIT]} position="relative" />
          </Box>
        ))}
      </Box>
      <Box display="flex" flexDirection="row" marginTop={2}>
        {Array.from({ length: 10 }, (_, index) => (
          <Box key={index} marginRight={0.5} onClick={() => handleClick(index as DIGIT, true)} sx={{ cursor: "pointer", border: selectedCell.color === index ? "2px solid #000000" : "2px solid transparent", borderRadius: 1 }}>
            {/* Soft fill, grid with lower opacity */}
            <Box width={32} height={32} bgcolor={COLOR_MAP[index as DIGIT]} position="relative" sx={{ opacity: 0.6 }} />
          </Box>
        ))}
        <Typography variant="body2" marginRight={1}>Soft Fill (doesn't fill empty cells):</Typography>
      </Box>
    </Box>
  );
}