import { Grid, Typography } from "@mui/material"
import type { TrainingData } from "../../types/trainingData"
import SolutionInput from "./SolutionInput"
import SolutionOutput from "./SolutionOutput"
import { useContext, useEffect } from "react"
import { AppContext, type AppContextProps } from "../Context/AppContext"

type SolutionProps = {
  input?: TrainingData[string]["test"][0]["input"], 
}

export default function Solution({ input }: SolutionProps) {

  const { handleChangeInputSolution } = useContext<AppContextProps>(AppContext);

  useEffect(() => {
    if (input) handleChangeInputSolution(input);
  }, [input]);

  if (!input) return null
  return (
    <Grid container>
      <Grid size={5}>
        <Typography variant="h6" marginBottom={1}>Input</Typography>
        <SolutionInput input={input} />
      </Grid>
      <Grid size={7}>
        <Typography variant="h6" marginBottom={1}>Output</Typography>
        <SolutionOutput />
      </Grid>
    </Grid>
  )
}