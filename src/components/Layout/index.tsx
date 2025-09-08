import { Box, Grid } from "@mui/material";
import { AppContext, type AppContextProps } from "../Context/AppContext";
import { useContext, useEffect, useMemo } from "react";
import Example from "../Example";
import type { TrainingData } from "../../types/trainingData";
import Solution from "../Solution";
import Tool from "../Tool";
import SubmitSolution from "../Tool/SubmitSolution";
import type { DIGIT } from "../../const";

type LayoutProps = {
  id: keyof TrainingData
}

export default function Layout({ id }: LayoutProps) {
  const { trainingData, handleChangeInputSolution } = useContext<AppContextProps>(AppContext);
  const inputSolution = useMemo(() => 
    trainingData?.[id].test.map(item => item.input) as [Array<Array<DIGIT>>] || [],
    [trainingData, id]
  );

  useEffect(() => {
    if (inputSolution.length > 0) handleChangeInputSolution(inputSolution);
  }, [inputSolution, handleChangeInputSolution]);

  return (
    <Grid container>
      <Grid size={5}>
        <Example examples={trainingData?.[id].train ?? []} />
      </Grid>
      <Grid size={7}>
        {trainingData?.[id].test?.map((_testItem, index) => (
          <Box key={index} marginBottom={2}>
            <Solution inputSolution={inputSolution} inputIndex={index} />
          <Tool matrixIndex={index} />
          </Box>
        ))}
        <Box marginBottom={2}>
        <SubmitSolution />
      </Box>
      </Grid>
    </Grid>
  );
}
