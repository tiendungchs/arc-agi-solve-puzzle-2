import { Box, Grid } from "@mui/material";
import { AppContext, type AppContextProps } from "../Context/AppContext";
import { useContext, useEffect, useMemo } from "react";
import Example from "../Example";
import type { TrainingData } from "../../types/trainingData";
import type { DIGIT } from "../../const";
import Solution from "../Solution";
import Tool from "../Tool";

type LayoutProps = {
  id: keyof TrainingData
}

export default function Layout({ id }: LayoutProps) {
  const { trainingData, handleChangeInputSolution, choosenTrainingId } = useContext<AppContextProps>(AppContext);
  const inputSolution = useMemo(() => 
    choosenTrainingId ? trainingData?.[choosenTrainingId].test.map(item => item.input)[0] as Array<Array<DIGIT>> || [] : [],
    [trainingData, choosenTrainingId]
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
        <Box marginBottom={2}>
          <Solution inputSolution={inputSolution ? [inputSolution] : undefined} inputIndex={0} />
          <Tool />
        </Box>
      </Grid>
    </Grid>
  );
}
