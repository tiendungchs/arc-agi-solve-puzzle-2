import { Box, Typography } from "@mui/material";
import ResizeInput from "./ResizeInput";
import EditOutputGridCell from "./EditOutputGridCell";
import SubmitSolution from "./SubmitSolution";
import { useContext } from "react";
import { AppContext, type AppContextProps } from "../Context/AppContext";


export default function Tool() {
  const { currentOutputIndex } = useContext<AppContextProps>(AppContext);
  return (
    <Box>
      <Typography variant="h5" marginBottom={2}>Tool - Editing Output Grid #{currentOutputIndex + 1}</Typography>
      <Box marginBottom={2}>
        <ResizeInput />
      </Box>
      <Box marginBottom={2}>
        <EditOutputGridCell />
      </Box>
      <Box marginBottom={2}>
        <SubmitSolution />
      </Box>
    </Box>
  );
}
