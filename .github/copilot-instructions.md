# ARC-AGI Puzzle Solver Instructions

## Project Overview

This is an interactive React+TypeScript application for solving ARC-AGI (Abstraction and Reasoning Corpus) puzzles. Users upload JSON training/test data, manually construct grid solutions using visual tools, and validate answers. The app tracks solution steps for analysis.

## Architecture & Data Flow

### Core Data Model

- **TrainingData**: JSON file with structure `{ [id: string]: { train: Array<{input, output}>, test: Array<{input}> } }`
- **DIGIT type**: Union type `-1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9` representing grid cell colors
- **Step tracking**: All user actions (fill, copy, rotate, etc.) recorded as `Step` objects for replay/download

### State Management Pattern

- **Single AppContext** (`src/components/Context/AppContext.tsx`): Centralized React Context with 20+ state variables
- All components use `useContext<AppContextProps>(AppContext)` - no prop drilling
- Critical state: `outputSolution` (user's answer grid), `selectedCell` (current tool mode), `step` (action history)
- Always use `cloneDeep()` from lodash when updating arrays/objects to avoid mutations

### Component Structure

```
App.tsx (file upload + training ID selector)
├── Layout/
│   ├── Example/ (shows training input/output pairs)
│   └── Solution/
│       ├── SolutionInput (displays test input grids)
│       ├── SolutionOutput (interactive canvas - main editing area)
│       └── Tool/ (resize, color palette, submit)
```

## Development Workflows

### Running the App

```bash
npm run dev          # Start Vite dev server at http://localhost:5173
npm run build        # TypeScript check + production build
npm run lint         # ESLint with flat config
```

### Working with Grids

- Grids rendered using **react-konva** (Canvas-based) in `SolutionOutput.tsx`
- Cell size: `UNIT = 12` pixels (defined in `src/const/index.ts`)
- Color mapping: `COLOR_MAP[digit]` converts DIGIT to hex color
- Grid coordinates: `[row][col]` or `{x: col, y: row}` - be careful with x/y!

### Keyboard Shortcuts (Select Mode)

When `selectedCell.mode === "select"` in SolutionOutput:

- `Ctrl/Cmd+C`: Copy selected area → sets `selectedCell.isCopied = true`
- `Ctrl/Cmd+V`: Paste from copied position to `selectedPos`
- `Escape`: Cancel selection
- `r`: Rotate 90° clockwise (square selections only)
- `h`/`v`: Flip horizontal/vertical
- `Arrow keys`: Project selection in direction (with rectangle)
- `n/s/e/w`: Project north/south/east/west (with line selection)
- `Ctrl+Arrow`: Force project
- `m`: Match operation (compare and mark differences)
- `2`/`3`: Re-scale selected area by factor

## Critical Conventions

### Type Safety

- **Never use plain numbers for colors** - always type as `DIGIT` or use `INDEX_DIGIT_MAP`
- Grid arrays typed as `Array<Array<DIGIT>>` not `number[][]`
- Position objects require `source: 'output' | 'test' | 'example'` field

### Mutation Prevention

```typescript
// CORRECT - always clone before modifying context state
const newOutput = cloneDeep(outputSolution);
newOutput[i][j] = selectedCell.color;
handleChangeOutputSolution(newOutput);

// WRONG - direct mutation
outputSolution[i][j] = selectedCell.color; // ❌
```

### Step Recording Pattern

Every grid modification must:

1. Clone current state
2. Perform operation
3. Create `Step` object with action type, positions, colors, size
4. Append to `step` array: `setStep([...step, newStep])`
5. Update output: `handleChangeOutputSolution(newOutput)`

See `SolutionOutput.tsx` lines 30-40 (fill action) for canonical example.

### Utility Functions

- `boundaryFill()`: Flood fill algorithm (mutates grid in-place)
- `projectRect()/projectLine()`: Extend selections in directions
- `compareValue()`: Deep equality check for solution validation
- `isBetweenPosition()`: Check if position in rectangle bounds

## Common Pitfalls

1. **Grid Coordinate Confusion**: Arrays are `[row][col]` but Position uses `{x: col, y: row}` - convert carefully
2. **Missing Step Tracking**: New operations must record Step or undo/step-download breaks
3. **Color Index -1**: White color uses `-1` as DIGIT - handle specially in mappings
4. **Select Mode State**: Many keyboard shortcuts only work when `selectedCell.mode === "select"` AND appropriate conditions (isCopied, position source, etc.)

## Integration Points

- **Material-UI v7**: All UI components from `@mui/material` - use MUI Grid/Box for layout
- **Konva**: Canvas rendering via `react-konva` - Stage/Layer/Rect pattern in Example/Solution components
- **Lodash**: Only `cloneDeep` used - keep this minimal dependency
- **File Upload**: Uses FileReader API to parse JSON - see `App.tsx` handleFileChange

## Testing Strategy

No automated tests currently. Manual testing workflow:

1. Use `visualize_json.ipynb` (Jupyter notebook) to inspect/visualize training data
2. Load sample JSON files through UI
3. Test transformations and verify with Submit Solution button
4. Download step JSON to verify action recording

## When Adding Features

- New grid operations → Add action type to `Step.action` union in `types/step.ts`
- New tools → Add to `Tool/index.tsx` and update `selectedCell.mode` options
- New keyboard shortcuts → Add to `handleChangeInput` in `SolutionOutput.tsx`
- State needed across components → Add to `AppContext` (avoid local state)
