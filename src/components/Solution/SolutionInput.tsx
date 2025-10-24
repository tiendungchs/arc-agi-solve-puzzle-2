import { Layer, Rect, Stage } from "react-konva";
import { COLOR_MAP, UNIT, type DIGIT } from "../../const";
import { useContext, useEffect } from "react";
import { AppContext, type AppContextProps } from "../Context/AppContext";
import { isBetweenPosition } from "../../utils/isBetween";

export type SolutionInputProps = {
  input: Array<Array<DIGIT>>,
  inputIndex: number
}

export default function SolutionInput({ input, inputIndex }: SolutionInputProps) {

  const {chosenMatrix, setChosenMatrix, startPosition, setStartPosition, currentPosition, setCurrentPosition, endPosition, setEndPosition,selectedCell, handleChangeSelectedCell } = useContext<AppContextProps>(AppContext);

  const rows = input.length;
  const cols = input[0].length;

  const handleKeydown = (e: KeyboardEvent) => {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    if (isCtrlOrCmd && e.key === 'c' && startPosition && endPosition && selectedCell.mode === "select" && selectedCell.position?.source === 'input' && chosenMatrix && chosenMatrix.index === inputIndex && chosenMatrix.matrix === 'test') {
      const x = Math.min(startPosition.x, endPosition.x);
      const y = Math.min(startPosition.y, endPosition.y);
      const sx = Math.abs(startPosition.x - endPosition.x) + 1;
      const sy = Math.abs(startPosition.y - endPosition.y) + 1;
      handleChangeSelectedCell({...selectedCell, position: {x, y, source: 'input'}, size: { width: sx, height: sy }, isCopied: true });
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [startPosition, endPosition]);
  
  useEffect(() => {
    if (selectedCell.mode !== "select") {
      setCurrentPosition(null);
      setStartPosition(null);
      setEndPosition(null);
    }
  }, [selectedCell.mode]);

  return (
    <Stage width={cols * UNIT} height={rows * UNIT}>
      <Layer>
        {input.map((row, i) =>
          row.map((cell, j) => (
            <Rect
              key={`${i}-${j}`}
              x={j * UNIT}
              y={i * UNIT}
              width={UNIT}
              height={UNIT}
              fill={COLOR_MAP[cell] || "#000000ff"}
              stroke="#fbfafaff"
              strokeWidth={1}
              onMouseDown={() => { if (selectedCell.mode === "select") {
                setStartPosition({ x: j, y: i, source: 'input'})
                setCurrentPosition(null)
                setEndPosition(null) 
                setChosenMatrix({matrix: 'test', index: inputIndex})
              }}}
              onMouseUp={() => { if (selectedCell.mode === "select") {
                setEndPosition({ x: j, y: i, source: 'input' })
                if (startPosition && startPosition.source === 'input') {
                  const x = Math.min(startPosition.x, j);
                  const y = Math.min(startPosition.y, i);
                  const sx = Math.abs(startPosition.x - j) + 1;
                  const sy = Math.abs(startPosition.y - i) + 1;
                  handleChangeSelectedCell({...selectedCell, position: {x, y, source: 'input'}, size: { width: sx, height: sy }, isCopied: false });
                }
              } }}
              onMouseOver={() => { if (startPosition && !endPosition) setCurrentPosition({ x: j, y: i, source: 'input'}) }}
              opacity={chosenMatrix && chosenMatrix.index === inputIndex && chosenMatrix.matrix === 'test' && !selectedCell.isCopied && selectedCell.position?.source === 'input' && startPosition && currentPosition && isBetweenPosition(startPosition, currentPosition, { x: j, y: i, source: 'input' }) ? 0.5 : 1}
            />
          ))
        )}
      </Layer>
    </Stage>
  )
}