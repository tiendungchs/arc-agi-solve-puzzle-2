import { Box } from "@mui/material";
import ResizeInput from "./ResizeInput";
import EditOutputGridCell from "./EditOutputGridCell";
import SubmitSolution from "./SubmitSolution";


export default function Tool() {
  return (
    <Box>
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
