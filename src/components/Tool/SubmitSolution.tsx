import { Box, Button, Typography } from "@mui/material";
import { useContext } from "react";
import { AppContext, type AppContextProps } from "../Context/AppContext";
import { compareValue } from "../../utils/compareValue";
import type { DIGIT } from "../../const";


export default function SubmitSolution() {
  const {chosenMatrix, trainingData, outputSolution, trainingSolution, choosenTrainingId, step, isCorrect, setIsCorrect } = useContext<AppContextProps>(AppContext);
  const handleSubmit = () => {
    if (!choosenTrainingId || (!trainingData && !trainingSolution) || !chosenMatrix) {
      return;
    }
    if (chosenMatrix.matrix === 'test') { 
      const matrixIndex = chosenMatrix.index;
      const solution = trainingSolution?.[choosenTrainingId] as Array<Array<Array<DIGIT>>>;
      const isCorrect = Boolean(compareValue(outputSolution, solution[matrixIndex]));
      setIsCorrect(isCorrect);
    } else {
      const matrixIndex = chosenMatrix.index;
      const examples = trainingData?.[choosenTrainingId].train as Array<{ input: Array<Array<DIGIT>>, output: Array<Array<DIGIT>> }>;
      const solution = examples[matrixIndex].output;
      const isCorrect = Boolean(compareValue(outputSolution, solution));
      setIsCorrect(isCorrect);
    }
  }

  const handleDownloadStep = () => {
    const result = {
      id: choosenTrainingId,
      steps: step
    };
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${choosenTrainingId}_${chosenMatrix?.matrix}_${chosenMatrix?.index}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Typography variant="h6" marginBottom={1}>3. See if your solution is correct:</Typography>
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Submit Solution
      </Button>
      {isCorrect !== null && (
        isCorrect === true ? 
        <Typography variant="body1" color="success.main" marginTop={2}>
          Correct Solution!
        </Typography> :
        <Typography variant="body1" color="error.main" marginTop={2}>
          Incorrect Solution!
        </Typography>
      )}
      {isCorrect !== null && (
        <Box marginTop={2}>
          <Typography variant="h6">4. Steps taken:</Typography>
          <Button variant="outlined" color="primary" onClick={handleDownloadStep}>
            Download Steps (check console)
          </Button>
        </Box>
      )}
    </Box>
  )
}