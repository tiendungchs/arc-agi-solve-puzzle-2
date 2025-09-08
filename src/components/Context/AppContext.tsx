import { createContext, useMemo, useState, type PropsWithChildren } from "react";
import type { TrainingData } from "../../types/trainingData"
import { DEFAULT_SELECTED_CELL, DEFAULT_SOLUTION_MATRIX, type DIGIT } from "../../const";
import type { SelectedCell } from "../../types/selectedCell";
import type { TrainingSolutionData } from "../../types/trainingSolutionData";
import type { Step } from "../../types/step";


export type AppContextProps = {
  error: boolean | null,
  setError: (error: boolean | null) => void,
  step: Step[],
  setStep: (step: Step[]) => void,
  trainingData: TrainingData | null,
  trainingSolution: TrainingSolutionData | null,
  setTrainingData: (trainingData: TrainingData | null) => void,
  setTrainingSolution: (trainingSolution: TrainingSolutionData | null) => void,
  listTrainingId: Array<string>,
  choosenTrainingId: string | null,
  handleChangeChoosenTrainingId: (id: string | null) => void,
  outputSolution: [Array<Array<DIGIT>>],
  handleChangeOutputSolution: (output: [Array<Array<DIGIT>>]) => void,
  inputSolution?: [Array<Array<DIGIT>>],
  handleChangeInputSolution: (input: [Array<Array<DIGIT>>] | undefined) => void,
  selectedCell: SelectedCell,
  handleChangeSelectedCell: (selectedCell: SelectedCell) => void,
}

export const AppContext = createContext<AppContextProps>({
  error: null,
  setError: () => {},
  step: [],
  setStep: () => {},
  trainingData: null,
  setTrainingData: () => {},
  listTrainingId: [],
  choosenTrainingId: null,
  handleChangeChoosenTrainingId: () => {},
  outputSolution: [DEFAULT_SOLUTION_MATRIX],
  handleChangeOutputSolution: () => {},
  inputSolution: undefined,
  handleChangeInputSolution: () => {},
  selectedCell: DEFAULT_SELECTED_CELL,
  handleChangeSelectedCell: () => {},
  trainingSolution: null,
  setTrainingSolution: () => {},
});

export default function AppContextProvider({ children }: PropsWithChildren) {
  const [trainingData, setTrainingData] = useState<TrainingData | null>(null);
  const [error, setError] = useState<boolean | null>(null);
  const [trainingSolution, setTrainingSolution] = useState<TrainingSolutionData | null>(null);
  const [step, setStep] = useState<Step[]>([]);
  const [outputSolution, setOutputSolution] = useState<[Array<Array<DIGIT>>]>([DEFAULT_SOLUTION_MATRIX]);
  const listTrainingId = useMemo(() => Object.keys(trainingData || {}).map(key => key), [trainingData]);
  const [choosenTrainingId, setChoosenTrainingId] = useState<string | null>(null);
  const [inputSolution, setInputSolution] = useState<[Array<Array<DIGIT>>] | undefined>(undefined);
  const [selectedCell, setSelectedCell] = useState<SelectedCell>(DEFAULT_SELECTED_CELL);
  const handleChangeChoosenTrainingId = (id: string | null) => {
    setChoosenTrainingId(id);
  };

  const handleChangeInputSolution = (input: [Array<Array<DIGIT>>] | undefined) => {
    setInputSolution(input);
  };

  const handleChangeOutputSolution = (output: [Array<Array<DIGIT>>]) => {
    setOutputSolution(output);
  };

  const handleChangeSelectedCell = (selectedCell: SelectedCell) => {
    setSelectedCell(selectedCell);
  };

  return (
    <AppContext.Provider value={{ trainingData, setTrainingData, listTrainingId, choosenTrainingId, handleChangeChoosenTrainingId, outputSolution, handleChangeOutputSolution, inputSolution, handleChangeInputSolution, selectedCell, handleChangeSelectedCell, trainingSolution, setTrainingSolution, step, setStep, error, setError }}>
      {children}
    </AppContext.Provider>
  );
}
