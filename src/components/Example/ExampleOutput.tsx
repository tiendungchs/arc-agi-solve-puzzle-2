import { Layer, Rect, Stage } from "react-konva";
import { COLOR_MAP, UNIT, type DIGIT } from "../../const";
import { useContext, useEffect } from "react";
import { AppContext, type AppContextProps } from "../Context/AppContext";
import { isBetweenPosition } from "../../utils/isBetween";


type ExampleOutputProps = {
  output: Array<Array<DIGIT>>;
  exampleIndex: number;
}

export default function ExampleOutput({ output, exampleIndex }: ExampleOutputProps) {

  const {startPosition, setStartPosition, currentPosition, setCurrentPosition, endPosition, setEndPosition,selectedCell, handleChangeSelectedCell } = useContext<AppContextProps>(AppContext);
  
  const rows = output.length;
  const cols = output[0].length;


  const handleKeydown = (e: KeyboardEvent) => {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    if (isCtrlOrCmd && e.key === 'c' && startPosition && endPosition && selectedCell.mode === "select" && selectedCell.position?.source === 'example_output' && selectedCell.position?.matrixIndex === exampleIndex) {
      const x = Math.min(startPosition.x, endPosition.x);
      const y = Math.min(startPosition.y, endPosition.y);
      const sx = Math.abs(startPosition.x - endPosition.x) + 1;
      const sy = Math.abs(startPosition.y - endPosition.y) + 1;
      handleChangeSelectedCell({...selectedCell, position: {x, y, source: 'example_output', matrixIndex: exampleIndex}, size: { width: sx, height: sy }, isCopied: true });
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
        {output.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Rect
              key={`${rowIndex}-${colIndex}`}
              x={colIndex * UNIT}
              y={rowIndex * UNIT}
              width={UNIT}
              height={UNIT}
              fill={COLOR_MAP[cell] || "#000000ff"}
              stroke="#fbfafaff"
              strokeWidth={1}
              onMouseDown={() => { if (selectedCell.mode === "select") {
                setStartPosition({ x: colIndex, y: rowIndex, source: 'example_output', matrixIndex: exampleIndex })
                setCurrentPosition(null)
                setEndPosition(null) 
              }}}
              onMouseUp={() => { if (selectedCell.mode === "select") {
                setEndPosition({ x: colIndex, y: rowIndex, source: 'example_output', matrixIndex: exampleIndex })
                if (startPosition && startPosition.source === 'example_output' && startPosition.matrixIndex === exampleIndex) {
                  const x = Math.min(startPosition.x, colIndex);
                  const y = Math.min(startPosition.y, rowIndex);
                  const sx = Math.abs(startPosition.x - colIndex) + 1;
                  const sy = Math.abs(startPosition.y - rowIndex) + 1;
                  handleChangeSelectedCell({...selectedCell, position: {x, y, source: 'example_output', matrixIndex: exampleIndex}, size: { width: sx, height: sy }, isCopied: false });
                }
              } }}
              onMouseOver={() => { if (startPosition && !endPosition) setCurrentPosition({ x: colIndex, y: rowIndex, source: 'example_output', matrixIndex: exampleIndex }) }}
              opacity={!selectedCell.isCopied && selectedCell.position?.source === 'example_output' && startPosition && currentPosition && isBetweenPosition(startPosition, currentPosition, { x: colIndex, y: rowIndex, source: 'example_output', matrixIndex: exampleIndex }) ? 0.5 : 1}
            />
          ))
        )}
      </Layer>
    </Stage>
  );
}