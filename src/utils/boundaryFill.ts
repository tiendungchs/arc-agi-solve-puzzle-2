import type { DIGIT } from "../const";


export const boundaryFill = (x: number, y: number, targetColor: DIGIT, replacementColor: DIGIT, rect: Array<Array<DIGIT>>) => {
  // Implement boundary fill algorithm using an iterative approach
  if (targetColor === replacementColor) return;
  
  const stack: [number, number][] = [[x, y]];
  const width = rect[0].length;
  const height = rect.length;
  
  while (stack.length > 0) {
    const [currX, currY] = stack.pop()!;
    
    if (currX < 0 || currX >= width || currY < 0 || currY >= height) continue;
    if (rect[currY][currX] !== targetColor) continue;
    
    rect[currY][currX] = replacementColor;
    
    stack.push([currX + 1, currY]);
    stack.push([currX - 1, currY]);
    stack.push([currX, currY + 1]);
    stack.push([currX, currY - 1]);
  }
}