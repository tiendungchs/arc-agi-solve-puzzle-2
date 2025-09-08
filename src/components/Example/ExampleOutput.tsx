import { Layer, Rect, Stage } from "react-konva";
import { COLOR_MAP, UNIT, type DIGIT } from "../../const";


type ExampleOutputProps = {
  output: Array<Array<DIGIT>>;
}

export default function ExampleOutput({ output }: ExampleOutputProps) {

  const rows = output.length;
  const cols = output[0].length;

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
            />
          ))
        )}
      </Layer>
    </Stage>
  );
}