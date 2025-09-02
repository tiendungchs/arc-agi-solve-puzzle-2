import { Stage, Layer, Rect } from "react-konva";
import { COLOR_MAP, UNIT, type DIGIT } from "../../const";

type ExampleInputProps = {
  input: Array<Array<DIGIT>>;
}

export default function ExampleInput({ input }: ExampleInputProps) {

  const rows = input.length;
  const cols = input[0].length;

  return (
    <Stage width={cols * UNIT} height={rows * UNIT}>
      <Layer>
        {input.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Rect
              key={`${rowIndex}-${colIndex}`}
              x={colIndex * UNIT}
              y={rowIndex * UNIT}
              width={UNIT}
              height={UNIT}
              fill={COLOR_MAP[cell] || "#ffffff"}
              stroke="#000000"
              strokeWidth={1}
            />
          ))
        )}
      </Layer>
    </Stage>
  );
}