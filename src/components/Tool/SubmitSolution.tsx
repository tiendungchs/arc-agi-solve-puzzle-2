import { Box, Button, Typography } from "@mui/material";
import { useContext, useState } from "react";
import { AppContext, type AppContextProps } from "../Context/AppContext";
import { compareValue } from "../../utils/compareValue";


export default function SubmitSolution() {
  const { outputSolution, trainingSolution, choosenTrainingId, step } = useContext<AppContextProps>(AppContext);
  const [error, setError] = useState<boolean | null>(null);

  const handleSubmit = () => {
    const isCorrect = Boolean(choosenTrainingId && compareValue(outputSolution, trainingSolution?.[choosenTrainingId].at(0) || []));
    setError(isCorrect);
  } 

  const handleDownloadStep = () => {
    const result = {
      id: choosenTrainingId,
      steps: step
    }
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${choosenTrainingId}_steps.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Typography variant="h6" marginBottom={1}>3. See if your solution is correct:</Typography>
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Submit Solution
      </Button>
      {error !== null && (
        error === true ? 
        <Typography variant="body1" color="success.main" marginTop={2}>
          Correct Solution!
        </Typography> :
        <Typography variant="body1" color="error.main" marginTop={2}>
          Incorrect Solution!
        </Typography>)}
      {error === true && <Box marginTop={2}>
        <Typography variant="h6">4. Steps taken:</Typography>
        <Button variant="outlined" color="primary" onClick={handleDownloadStep}>
          Download Steps (check console)
        </Button>
      </Box>}
    </Box>
  )
}