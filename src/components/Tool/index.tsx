import { Box } from "@mui/material";
import ResizeInput from "./ResizeOutput";
import EditOutputGridCell from "./EditOutputGridCell";


export default function Tool({ matrixIndex }: { matrixIndex: number }) {
  return (
    <Box>
      <Box marginBottom={2}>
        <ResizeInput matrixIndex={matrixIndex} />
      </Box>
      <Box marginBottom={2}>
        <EditOutputGridCell matrixIndex={matrixIndex} />
      </Box>
    </Box>
  );
}