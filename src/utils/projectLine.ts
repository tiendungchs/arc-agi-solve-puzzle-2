export const projectLine = (matrix: Array<Array<DIGIT>>, position: { x: number; y: number }, size: { width: number; height: number }, direction: 'north' | 'south' | 'east' | 'west') => {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const project = (x: number, y: number, direction: 'north' | 'south' | 'east' | 'west', targetColor: DIGIT, replacementColor: DIGIT) => {
        if (x < 0 || x >= cols || y < 0 || y >= rows) return;
        if (matrix[y][x] !== targetColor) return;
        matrix[y][x] = replacementColor;
        if (direction === 'north') {
            project(x + 1, y - 1, direction, targetColor, replacementColor);
        }
        else if (direction === 'south') {
            project(x - 1, y + 1, direction, targetColor, replacementColor);
        }
        else if (direction === 'east') {
            project(x + 1, y + 1, direction, targetColor, replacementColor);
        }
        else if (direction === 'west') {
            project(x - 1, y - 1, direction, targetColor, replacementColor);
        }
    };

    if (direction === 'north') {
        for (let i = 0; i < size.height; i++) {
            for (let j = 0; j < size.width; j++) {
                const x = position.x + j + 1;
                const y = position.y + i - 1;
                if (x < 0 || x >= cols || y < 0 || y >= rows) continue;
                project(x, y, direction, matrix[y][x], matrix[y + 1][x - 1]);
            }
        }
    }
    else if (direction === 'south') {
        for (let i = 0; i < size.height; i++) {
            for (let j = 0; j < size.width; j++) {
                const x = position.x + j - 1;
                const y = position.y + i + 1;
                if (x < 0 || x >= cols || y < 0 || y >= rows) continue;
                project(x, y, direction, matrix[y][x], matrix[y - 1][x + 1]);
            }
        }
    }
    else if (direction === 'east') {
        for (let i = 0; i < size.height; i++) {
            for (let j = 0; j < size.width; j++) {
                const x = position.x + j + 1;
                const y = position.y + i + 1;
                if (x < 0 || x >= cols || y < 0 || y >= rows) continue;
                project(x, y, direction, matrix[y][x], matrix[y - 1][x - 1]);
            }
        }
    }
    else if (direction === 'west') {
        for (let i = 0; i < size.height; i++) {
            for (let j = 0; j < size.width; j++) {
                const x = position.x + j - 1;
                const y = position.y + i - 1;
                if (x < 0 || x >= cols || y < 0 || y >= rows) continue;
                project(x, y, direction, matrix[y][x], matrix[y + 1][x + 1]);
            }
        }
    }

}
import type { DIGIT } from "../const";