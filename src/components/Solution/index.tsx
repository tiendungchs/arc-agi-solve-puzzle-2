import { Grid, Typography } from "@mui/material"
import SolutionInput from "./SolutionInput"
import SolutionOutput from "./SolutionOutput"
import type { DIGIT } from "../../const"

type SolutionProps = {
  inputSolution?: Array<Array<Array<DIGIT>>>,
  inputIndex: number
}

export default function Solution({ inputSolution, inputIndex }: SolutionProps) {

  if (!inputSolution) return null
  const input = inputSolution[inputIndex];
  return (
    <Grid container>
      <Grid size={5}>
        <Typography variant="h6" marginBottom={1}>Input</Typography>
        <SolutionInput input={input} inputIndex={inputIndex} />
      </Grid>
      <Grid size={7}>
        <Typography variant="h6" marginBottom={1}>Output</Typography>
        <SolutionOutput outputIndex={inputIndex} />
      </Grid>
    </Grid>
  )
}