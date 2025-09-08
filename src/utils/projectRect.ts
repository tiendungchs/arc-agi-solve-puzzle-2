import type { DIGIT } from "../const";

export const projectRect = (rect: Array<Array<DIGIT>>, direction: 'up' | 'down' | 'left' | 'right'): Array<Array<DIGIT>> => {
    const rows = rect.length;
    const cols = rect[0].length;
    const project = (x: number, y: number, targetColor: DIGIT, replacementColor: DIGIT) => {
        if (x < 0 || x >= cols || y < 0 || y >= rows) return;
        if (rect[y][x] !== targetColor) return;
        rect[y][x] = replacementColor;
        if (direction === 'up') {
            project(x, y - 1, targetColor, replacementColor);
        }
        else if (direction === 'down') {
            project(x, y + 1, targetColor, replacementColor);
        }
        else if (direction === 'left') {
            project(x - 1, y, targetColor, replacementColor);
        }
        else if (direction === 'right') {
            project(x + 1, y, targetColor, replacementColor);
        }
    };

    if (direction === 'up') {
        for (let j = 0; j < cols; j++) {
            project(j, rows - 2, rect[rows - 2][j], rect[rows - 1][j]);
        }
    }
    else if (direction === 'down') {
        for (let j = 0; j < cols; j++) {
            project(j, 1, rect[1][j], rect[0][j]);
        }
    }
    else if (direction === 'left') {
        for (let i = 0; i < rows; i++) {
            project(cols - 2, i, rect[i][cols - 2], rect[i][cols - 1]);
        }
    }
    else if (direction === 'right') {
        for (let i = 0; i < rows; i++) {
            project(1, i, rect[i][1], rect[i][0]);
        }
    }

    return rect;
}