import { Box, Grid, Typography } from "@mui/material";
import { AppContext, type AppContextProps } from "../Context/AppContext";
import { useContext, useEffect, useMemo } from "react";
import Example from "../Example";
import type { TrainingData } from "../../types/trainingData";
import Tool from "../Tool";
import SubmitSolution from "../Tool/SubmitSolution";
import type { DIGIT } from "../../const";
import SolutionOutput from "../Solution/SolutionOutput";
import SolutionInput from "../Solution/SolutionInput";

type LayoutProps = {
  id: keyof TrainingData
}

export default function Layout({ id }: LayoutProps) {
  const { trainingData, handleChangeInputSolution } = useContext<AppContextProps>(AppContext);
  const inputSolution = useMemo(() => 
    trainingData?.[id].test.map(item => item.input) as Array<Array<Array<DIGIT>>> || [],
    [trainingData, id]
  );

  useEffect(() => {
    if (inputSolution.length > 0) handleChangeInputSolution(inputSolution);
  }, [inputSolution, handleChangeInputSolution]);

  return (
    <Grid container spacing={2}>
      <Grid size={5}>
        <Example examples={trainingData?.[id].train ?? []} />
      </Grid>
      <Grid size={7}>
        <Grid container spacing={2}>
          <Grid size={6}>
            {/* Test inputs */}
            {inputSolution.map((_matrix, index) => (
              <Box key={index} marginBottom={4}>
                <Typography variant="h6" marginBottom={1}>Input {index + 1}</Typography>
                <SolutionInput input={inputSolution[index]} inputIndex={index} />
              </Box>
            ))}
          </Grid>
          <Grid size={6}>
            {/* Single output and tools on the right */}
            <Typography variant="h6" marginBottom={1}>Output</Typography>
            <SolutionOutput />
            <Box marginTop={2}>
              <Tool />
            </Box>
            <Box marginTop={2}>
              <SubmitSolution />
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}