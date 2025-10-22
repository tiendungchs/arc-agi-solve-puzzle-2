export type Position = {
  x: number;
  y: number;
  source: 'input' | 'output' | 'example_input' | 'example_output';
  matrixIndex: number;
};
