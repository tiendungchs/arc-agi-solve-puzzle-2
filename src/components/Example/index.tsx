import { Box, Grid, Typography } from "@mui/material";
import type { TrainingData } from "../../types/trainingData"
import ExampleInput from "./ExampleInput";
import ExampleOutput from "./ExampleOutput";

type ExampleProps = {
  examples: TrainingData[string]["train"];
}

export default function Example({ examples }: ExampleProps) {
  return (
    <Box width="100%">
      {examples.map((example, index) => (
        <Box key={index}>
          <Typography variant="h6" marginBottom={1}>Example {index + 1}</Typography>
          <Grid container spacing={2} marginBottom={2}>
            <Grid size={6}>
              <ExampleInput input={example.input} />
            </Grid>
            <Grid size={6}>
              <ExampleOutput output={example.output} />
            </Grid>
          </Grid>
        </Box>
      ))}
    </Box>
  );
}