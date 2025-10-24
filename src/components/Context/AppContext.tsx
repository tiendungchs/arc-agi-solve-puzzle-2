import { createContext, useMemo, useState, type PropsWithChildren } from "react";
import type { TrainingData } from "../../types/trainingData"
import { DEFAULT_SELECTED_CELL, DEFAULT_SOLUTION_MATRIX, type DIGIT } from "../../const";
import type { SelectedCell } from "../../types/selectedCell";
import type { TrainingSolutionData } from "../../types/trainingSolutionData";
import type { Step } from "../../types/step";
import { cloneDeep } from "lodash"
import type { Position } from "../../types/position";
import type { SolutionFor } from "../../types/solutionFor";



export type AppContextProps = {
  chosenMatrix: SolutionFor | null,
  setChosenMatrix: (matrix: SolutionFor | null) => void,
  selectedPos: Position | null,
  setSelectedPos: (position: Position | null) => void,
  startPosition: Position | null,
  setStartPosition: (position: Position | null) => void,
  currentPosition: Position | null,
  setCurrentPosition: (position: Position | null) => void,
  endPosition: Position | null,
  setEndPosition: (position: Position | null) => void,
  redoStep: Step[],
  setRedoStep: (step: Step[]) => void,
  isCorrect: boolean | null,
  setIsCorrect: (isCorrect: boolean | null) => void,
  error: boolean | null,
  setError: (error: boolean | null) => void,
  step: Step[],
  setStep: (step: Step[]) => void,
  trainingData: TrainingData | null,
  setTrainingData: (trainingData: TrainingData | null) => void,
  trainingSolution: TrainingSolutionData | null,
  setTrainingSolution: (trainingSolution: TrainingSolutionData | null) => void,
  listTrainingId: Array<string>,
  choosenTrainingId: string | null,
  handleChangeChoosenTrainingId: (id: string | null) => void,
  outputSolution: Array<Array<DIGIT>>,
  handleChangeOutputSolution: (output: Array<Array<DIGIT>>) => void,
  inputSolution?: Array<Array<Array<DIGIT>>>,
  handleChangeInputSolution: (input: Array<Array<Array<DIGIT>>> | undefined) => void,
  selectedCell: SelectedCell,
  handleChangeSelectedCell: (selectedCell: SelectedCell) => void,
}

export const AppContext = createContext<AppContextProps>({
  chosenMatrix: null,
  setChosenMatrix: () => {},
  selectedPos: null,
  setSelectedPos: () => {},
  startPosition: null,
  setStartPosition: () => {},
  currentPosition: null,
  setCurrentPosition: () => {},
  endPosition: null,
  setEndPosition: () => {},
  redoStep: [],
  setRedoStep: () => {},
  isCorrect: null,
  setIsCorrect: () => {},
  error: null,
  setError: () => {},
  step: [],
  setStep: () => {},
  trainingData: null,
  setTrainingData: () => {},
  trainingSolution: null,
  setTrainingSolution: () => {},
  listTrainingId: [],
  choosenTrainingId: null,
  handleChangeChoosenTrainingId: () => {},
  outputSolution: cloneDeep(DEFAULT_SOLUTION_MATRIX),
  handleChangeOutputSolution: () => {},
  inputSolution: undefined,
  handleChangeInputSolution: () => {},
  selectedCell: DEFAULT_SELECTED_CELL,
  handleChangeSelectedCell: () => {},
});

export default function AppContextProvider({ children }: PropsWithChildren) {
  const [chosenMatrix, setChosenMatrix] = useState<SolutionFor | null>(null);
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [startPosition, setStartPosition] = useState<Position | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [endPosition, setEndPosition] = useState<Position | null>(null);
  const [redoStep, setRedoStep] = useState<Step[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [trainingData, setTrainingData] = useState<TrainingData | null>(null);
  const [trainingSolution, setTrainingSolution] = useState<TrainingSolutionData | null>(null);
  const [error, setError] = useState<boolean | null>(null);
  const [step, setStep] = useState<Step[]>([]);
  const [outputSolution, setOutputSolution] = useState<Array<Array<DIGIT>>>(cloneDeep(DEFAULT_SOLUTION_MATRIX));
  const listTrainingId = useMemo(() => Object.keys(trainingData || {}).map(key => key), [trainingData]);
  const [choosenTrainingId, setChoosenTrainingId] = useState<string | null>(null);
  const [inputSolution, setInputSolution] = useState<Array<Array<Array<DIGIT>>> | undefined>(undefined);
  const [selectedCell, setSelectedCell] = useState<SelectedCell>(DEFAULT_SELECTED_CELL);
  const handleChangeChoosenTrainingId = (id: string | null) => {
    setChoosenTrainingId(id);
  };

  const handleChangeInputSolution = (input: Array<Array<Array<DIGIT>>> | undefined) => {
    setInputSolution(input);
  };

  const handleChangeOutputSolution = (output: Array<Array<DIGIT>>) => {
    setOutputSolution(output);
  };

  const handleChangeSelectedCell = (selectedCell: SelectedCell) => {
    setSelectedCell(selectedCell);
  };

  return (
    <AppContext.Provider value={{ trainingData, setTrainingData, listTrainingId, choosenTrainingId, handleChangeChoosenTrainingId, outputSolution, handleChangeOutputSolution, inputSolution, handleChangeInputSolution, selectedCell, handleChangeSelectedCell, trainingSolution, setTrainingSolution, step, setStep, error, setError, isCorrect, setIsCorrect, redoStep, setRedoStep, startPosition, setStartPosition, currentPosition, setCurrentPosition, endPosition, setEndPosition, selectedPos, setSelectedPos, chosenMatrix, setChosenMatrix }}>
      {children}
    </AppContext.Provider>
  );
}
