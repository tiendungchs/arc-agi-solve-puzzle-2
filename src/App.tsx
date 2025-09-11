import { useContext } from 'react';
import FileInput from './components/Input/FileInput'
import type { TrainingData } from './types/trainingData'
import { type AppContextProps, AppContext } from './components/Context/AppContext';
import Layout from './components/Layout';
import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import type { TrainingSolutionData } from './types/trainingSolutionData';
import { DEFAULT_SELECTED_CELL, DEFAULT_SOLUTION_MATRIX } from './const';
import { cloneDeep } from 'lodash';

function App() {
  const { trainingData, setTrainingData, handleChangeChoosenTrainingId, choosenTrainingId, listTrainingId, setTrainingSolution, setStep, setIsCorrect, handleChangeOutputSolution, handleChangeSelectedCell } = useContext<AppContextProps>(AppContext);
  const handleFileChange = (newFile: File | null) => {
    if (newFile) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const fileContent = e.target?.result;
        const jsonData = JSON.parse(fileContent as string) as TrainingData;
        setTrainingData(jsonData);
        handleChangeChoosenTrainingId(Object.keys(jsonData)[0] || null);
        setStep([]);
      };
      reader.readAsText(newFile);
    }
  }

  const handleSolutionFileChange = (newFile: File | null) => {
    if (newFile) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const fileContent = e.target?.result;
        const jsonData = JSON.parse(fileContent as string) as TrainingSolutionData;
        setTrainingSolution(jsonData);
      };
      reader.readAsText(newFile);
    }
  };

  return (
      <Box gap={2}>
        <Box marginBottom={2} display="flex" flexDirection="row" gap={2}>
          <Box display="flex">
            <FileInput
              id="training"
              label="Upload Training File"
              onFileChange={handleFileChange}
            />
          </Box>
          <Box display='flex'>
            <FileInput
              id="training-solution"
              label="Upload Training Solution File"
              onFileChange={handleSolutionFileChange}
            />
          </Box>
        </Box>
        {choosenTrainingId && 
        <>
          <Autocomplete
            fullWidth={false}
            value={choosenTrainingId}
            options={listTrainingId}
            onChange={(_, newValue) => {
              handleChangeChoosenTrainingId(newValue);
              setStep([]);
              setIsCorrect(null);
              handleChangeSelectedCell(cloneDeep(DEFAULT_SELECTED_CELL));
              handleChangeOutputSolution(Array.from({ length: newValue ? (trainingData?.[newValue].test.length || 1) : 1 }, () => DEFAULT_SOLUTION_MATRIX));
            }}
            renderInput={(params) => <TextField {...params} label="Select Training ID" />}
          />
          <Typography variant="h5" gutterBottom>Selected Training ID: {choosenTrainingId}</Typography>
          <Layout id={choosenTrainingId} />
        </>}
      </Box>
  )
}

export default App
