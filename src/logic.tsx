/**
 * 2048 게임에서, Map을 특정 방향으로 이동했을 때 결과를 반환하는 함수입니다.
 * @param map 2048 맵. 빈 공간은 null 입니다.
 * @param direction 이동 방향
 * @returns 이동 방향에 따른 결과와 이동되었는지 여부
 */
export const moveMapIn2048Rule = (
  map: Map2048,
  direction: Direction,
): MoveResult => {
  if (!validateMapIsNByM(map)) throw new Error("Map is not N by M");

  const rotatedMap = rotateMapCounterClockwise(map, rotateDegreeMap[direction]);

  const { result, isMoved, score } = moveLeft(rotatedMap);

  return {
    result: rotateMapCounterClockwise(result, revertDegreeMap[direction]),
    isMoved,
    score, 
  };
};


const validateMapIsNByM = (map: Map2048) => {
  const firstColumnCount = map[0].length;
  return map.every((row) => row.length === firstColumnCount);
};

const rotateMapCounterClockwise = (
  map: Map2048,
  degree: 0 | 90 | 180 | 270,
): Map2048 => {
  const rowLength = map.length;
  const columnLength = map[0].length;

  switch (degree) {
    case 0:
      return map;
    case 90:
      return Array.from({ length: columnLength }, (_, columnIndex) =>
        Array.from(
          { length: rowLength },
          (_, rowIndex) => map[rowIndex][columnLength - columnIndex - 1],
        ),
      );
    case 180:
      return Array.from({ length: rowLength }, (_, rowIndex) =>
        Array.from(
          { length: columnLength },
          (_, columnIndex) =>
            map[rowLength - rowIndex - 1][columnLength - columnIndex - 1],
        ),
      );
    case 270:
      return Array.from({ length: columnLength }, (_, columnIndex) =>
        Array.from(
          { length: rowLength },
          (_, rowIndex) => map[rowLength - rowIndex - 1][columnIndex],
        ),
      );
  }
};

const moveLeft = (map: Map2048): MoveResult => {
  let totalScore = 0;
  const movedRows = map.map((row) => {
    const moved = moveRowLeft(row);
    totalScore += moved.score;
    return moved;
  });
  const result = movedRows.map((m) => m.result);
  const isMoved = movedRows.some((m) => m.isMoved);
  return { result, isMoved, score: totalScore };
};

const moveRowLeft = (
  row: Cell[]
): { result: Cell[]; isMoved: boolean; score: number } => {
  let scoreGained = 0;

  const reduced = row.reduce(
    (acc: { lastCell: Cell; result: Cell[] }, cell) => {
      if (cell === null) return acc;
      if (acc.lastCell === null) {
        return { ...acc, lastCell: cell };
      } else if (acc.lastCell === cell) {
        scoreGained += cell * 2; 
        return { result: [...acc.result, cell * 2], lastCell: null };
      } else {
        return { result: [...acc.result, acc.lastCell], lastCell: cell };
      }
    },
    { lastCell: null, result: [] }
  );

  const result = [...reduced.result, reduced.lastCell];
  const resultRow = Array.from(
    { length: row.length },
    (_, i) => result[i] ?? null
  );

  return {
    result: resultRow,
    isMoved: row.some((cell, i) => cell !== resultRow[i]),
    score: scoreGained,
  };
};

const rotateDegreeMap: DirectionDegreeMap = {
  up: 90,
  right: 180,
  down: 270,
  left: 0,
};

const revertDegreeMap: DirectionDegreeMap = {
  up: 270,
  right: 180,
  down: 90,
  left: 0,
};

type Cell = number | null;
export type Map2048 = Cell[][];
type Direction = "up" | "left" | "right" | "down";
type RotateDegree = 0 | 90 | 180 | 270;
type DirectionDegreeMap = Record<Direction, RotateDegree>;
type MoveResult = { result: Map2048; isMoved: boolean; score: number };

export type Board = (number | null)[][];

export type SaveState = {
  board: Board;
  score: number;
  gameOver: boolean;
};

// logic.ts

export type Grid = number[][];
export type Dir = 'Left' | 'Right' | 'Up' | 'Down';
export const SIZE = 4;

export function emptyGrid(): Grid {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

export function cloneGrid(g: Grid): Grid {
  return g.map((row) => row.slice());
}

function getEmptyCells(g: Grid) {
  const cells: { r: number; c: number }[] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (g[r][c] === 0) cells.push({ r, c });
    }
  }
  return cells;
}

export function spawnRandomTile(g: Grid): Grid {
  const empty = getEmptyCells(g);
  if (empty.length === 0) return g;

  const spot = empty[Math.floor(Math.random() * empty.length)];
  const value = Math.random() < 0.9 ? 2 : 4;

  const nextGrid = cloneGrid(g);
  nextGrid[spot.r][spot.c] = value;
  return nextGrid;
}

function slideAndMerge(line: number[]): { result: number[]; scoreDelta: number; moved: boolean } {
  const nonZero = line.filter((n) => n !== 0);
  const merged: number[] = [];
  let scoreDelta = 0;

  for (let i = 0; i < nonZero.length; i++) {
    if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
      const val = nonZero[i] * 2;
      merged.push(val);
      scoreDelta += val;
      i++;
    } else {
      merged.push(nonZero[i]);
    }
  }
  while (merged.length < SIZE) merged.push(0);

  const moved = !arraysEqual(line, merged);
  return { result: merged, scoreDelta, moved };
}

function arraysEqual(a: number[], b: number[]) {
  return a.length === b.length && a.every((val, i) => val === b[i]);
}

export function move(grid: Grid, dir: Dir): { grid: Grid; moved: boolean; scoreDelta: number } {
  let moved = false;
  let scoreDelta = 0;
  const nextGrid = cloneGrid(grid);

  const applyLine = (
    getLine: () => number[],
    setLine: (values: number[]) => void,
    reversed: boolean
  ) => {
    const raw = getLine();
    const line = reversed ? [...raw].reverse() : raw;

    const { result, scoreDelta: delta, moved: lineMoved } = slideAndMerge(line);
    const finalLine = reversed ? [...result].reverse() : result;

    setLine(finalLine);
    if (lineMoved) moved = true;
    scoreDelta += delta;
  };

  switch (dir) {
    case 'Left':
      for (let r = 0; r < SIZE; r++) {
        applyLine(() => nextGrid[r], (vals) => { nextGrid[r] = vals; }, false);
      }
      break;
    case 'Right':
      for (let r = 0; r < SIZE; r++) {
        applyLine(() => nextGrid[r], (vals) => { nextGrid[r] = vals; }, true);
      }
      break;
    case 'Up':
      for (let c = 0; c < SIZE; c++) {
        applyLine(
          () => nextGrid.map((row) => row[c]),
          (vals) => { for (let r = 0; r < SIZE; r++) nextGrid[r][c] = vals[r]; },
          false
        );
      }
      break;
    case 'Down':
      for (let c = 0; c < SIZE; c++) {
        applyLine(
          () => nextGrid.map((row) => row[c]),
          (vals) => { for (let r = 0; r < SIZE; r++) nextGrid[r][c] = vals[r]; },
          true
        );
      }
      break;
  }

  return { grid: nextGrid, moved, scoreDelta };
}

export function hasMoves(grid: Grid): boolean {
  if (getEmptyCells(grid).length > 0) return true;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const val = grid[r][c];
      if (r + 1 < SIZE && grid[r + 1][c] === val) return true;
      if (c + 1 < SIZE && grid[r][c + 1] === val) return true;
    }
  }
  return false;
}

export function maxTile(grid: Grid): number {
  return Math.max(...grid.flat());
}
