import { Box } from "@mui/material";
import ResizeInput from "./ResizeOutput";
import EditOutputGridCell from "./EditOutputGridCell";


export default function Tool() {
  return (
    <Box>
      <Box marginBottom={2}>
        <ResizeInput />
      </Box>
      <Box marginBottom={2}>
        <EditOutputGridCell />
      </Box>
    </Box>
  );
}