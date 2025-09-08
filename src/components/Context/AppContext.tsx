import { createContext, useMemo, useState, type Dispatch, type PropsWithChildren } from "react";
import type { TrainingData } from "../../types/trainingData"
import { DEFAULT_SELECTED_CELL, DEFAULT_SOLUTION_MATRIX, type DIGIT } from "../../const";
import type { SelectedCell } from "../../types/selectedCell";
import type { TrainingSolutionData } from "../../types/trainingSolutionData";
import type { Step } from "../../types/step";


export type AppContextProps = {
  error: boolean | null,
  setError: (error: boolean | null) => void,
  step: Step[],
  currentOutputIndex: number,
  setCurrentOutputIndex: (index: number) => void,
  setStep: (step: Step[]) => void,
  trainingData: TrainingData | null,
  trainingSolution: TrainingSolutionData | null,
  setTrainingData: (trainingData: TrainingData | null) => void,
  setTrainingSolution: (trainingSolution: TrainingSolutionData | null) => void,
  listTrainingId: Array<string>,
  choosenTrainingId: string | null,
  handleChangeChoosenTrainingId: (id: string | null) => void,
  outputSolution: Array<Array<Array<DIGIT>>>,
  setOutputSolution: Dispatch<React.SetStateAction<Array<Array<Array<DIGIT>>>>>,
  inputSolution?: Array<Array<DIGIT>>,
  handleChangeInputSolution: (input: Array<Array<DIGIT>>) => void,
  selectedCell: SelectedCell,
  handleChangeSelectedCell: (selectedCell: SelectedCell) => void,
  redoStep: Step[],
  setRedoStep: (step: Step[]) => void,
}

export const AppContext = createContext<AppContextProps>({
  error: null,
  setError: () => { },
  step: [],
  setStep: () => { },
  redoStep: [],
  setRedoStep: () => { },
  currentOutputIndex: 0,
  setCurrentOutputIndex: () => { },
  trainingData: null,
  setTrainingData: () => { },
  listTrainingId: [],
  choosenTrainingId: null,
  handleChangeChoosenTrainingId: () => { },
  outputSolution: [DEFAULT_SOLUTION_MATRIX],
  setOutputSolution: () => { },
  inputSolution: undefined,
  handleChangeInputSolution: () => { },
  selectedCell: DEFAULT_SELECTED_CELL,
  handleChangeSelectedCell: () => { },
  trainingSolution: null,
  setTrainingSolution: () => { },
});

export default function AppContextProvider({ children }: PropsWithChildren) {
  const [trainingData, setTrainingData] = useState<TrainingData | null>(null);
  const [error, setError] = useState<boolean | null>(null);
  const [trainingSolution, setTrainingSolution] = useState<TrainingSolutionData | null>(null);
  const [step, setStep] = useState<Step[]>([]);
  const [currentOutputIndex, setCurrentOutputIndex] = useState<number>(0);
  const [redoStep, setRedoStep] = useState<Step[]>([]);
  const [outputSolution, setOutputSolution] = useState<Array<Array<Array<DIGIT>>>>([DEFAULT_SOLUTION_MATRIX]);
  const listTrainingId = useMemo(() => Object.keys(trainingData || {}).map(key => key), [trainingData]);
  const [choosenTrainingId, setChoosenTrainingId] = useState<string | null>(null);
  const [inputSolution, setInputSolution] = useState<Array<Array<DIGIT>>>([]);
  const [selectedCell, setSelectedCell] = useState<SelectedCell>(DEFAULT_SELECTED_CELL);
  const handleChangeChoosenTrainingId = (id: string | null) => {
    setChoosenTrainingId(id);
  };

  const handleChangeInputSolution = (input: Array<Array<DIGIT>>) => {
    setInputSolution(input);
  };

  const handleChangeSelectedCell = (selectedCell: SelectedCell) => {
    setSelectedCell(selectedCell);
  };

  return (
    <AppContext.Provider value={{ trainingData, setTrainingData, listTrainingId, choosenTrainingId, handleChangeChoosenTrainingId, outputSolution, setOutputSolution, inputSolution, handleChangeInputSolution, selectedCell, handleChangeSelectedCell, trainingSolution, setTrainingSolution, step, setStep, currentOutputIndex, setCurrentOutputIndex, redoStep, setRedoStep, error, setError }}>
      {children}
    </AppContext.Provider>
  );
}
