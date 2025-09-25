import { useEffect, useState } from "react";
import { moveMapIn2048Rule } from "./logic";
import type { Map2048 } from "./logic";
import "./style.css";

const SIZE = 4;

const generateEmptyMap = (): Map2048 =>
  Array.from({ length: SIZE }, () => Array(SIZE).fill(null));

const getRandomEmptyCell = (map: Map2048): [number, number] | null => {
  const emptyCells: [number, number][] = [];
  map.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (cell === null) emptyCells.push([r, c]);
    })
  );
  if (emptyCells.length === 0) return null;
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
};

const addRandomTile = (map: Map2048): Map2048 => {
  const pos = getRandomEmptyCell(map);
  if (!pos) return map;
  const [r, c] = pos;
  const newMap = map.map((row) => [...row]);
  newMap[r][c] = Math.random() < 0.9 ? 2 : 4;
  return newMap;
};

export default function App() {
  const [map, setMap] = useState<Map2048>(() =>
    addRandomTile(addRandomTile(generateEmptyMap()))
  );
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<
    { map: Map2048; score: number }[]
  >([]);
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");

  const restart = () => {
    setMap(addRandomTile(addRandomTile(generateEmptyMap())));
    setScore(0);
    setHistory([]);
    setStatus("playing");
  };

  const undo = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setMap(prev.map);
      setScore(prev.score);
      setHistory(history.slice(0, -1));
      setStatus("playing");
    }
  };

  const checkWinLose = (map: Map2048) => {
    // Win condition
    if (map.some((row) => row.some((cell) => cell === 128))) {
      setStatus("won");
      return;
    }

    // Lose condition: no empty cells and no merges possible
    if (getRandomEmptyCell(map) === null) {
      const directions: ("up" | "down" | "left" | "right")[] = [
        "up",
        "down",
        "left",
        "right",
      ];
      const stuck = directions.every(
        (d) => !moveMapIn2048Rule(map, d).isMoved
      );
      if (stuck) setStatus("lost");
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (status !== "playing") return;

    let direction: "up" | "down" | "left" | "right" | null = null;
    if (e.key === "ArrowUp") direction = "up";
    else if (e.key === "ArrowDown") direction = "down";
    else if (e.key === "ArrowLeft") direction = "left";
    else if (e.key === "ArrowRight") direction = "right";

    if (direction) {
      const prevState = { map, score };
      const { result, isMoved, score: gained } = moveMapIn2048Rule(
        map,
        direction
      );
      if (isMoved) {
        const newMap = addRandomTile(result);
        setHistory([...history, prevState]);
        setMap(newMap);
        setScore(score + gained);
        checkWinLose(newMap);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div className="container">
      <div className="header">
        <h1>2048</h1>
        <div className="scoreboard">
          <div>Score: {score}</div>
        </div>
        <div className="buttons">
          <button onClick={restart}>Restart</button>
          <button onClick={undo}>Undo</button>
        </div>
      </div>

      <div className="game">
        {map.map((row, rowIndex) => (
          <div className="row" key={rowIndex}>
            {row.map((cell, colIndex) => (
              <div className={`cell value-${cell}`} key={colIndex}>
                {cell ?? ""}
              </div>
            ))}
          </div>
        ))}
      </div>

      {status !== "playing" && (
        <div className="overlay">
          {status === "won" ? "🎉 You win!" : "💀 Game Over!"}
          <button onClick={restart}>Play Again</button>
        </div>
      )}
    </div>
  );
}
