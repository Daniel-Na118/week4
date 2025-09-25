import { useEffect, useState } from "react";
import { type Dir, type Grid, emptyGrid, hasMoves, maxTile, move, spawnRandomTile } from "./logic";
import "./style.css";

type SaveState = {
  grid: Grid;
  score: number;
  status: "Playing" | "Won" | "Over";
};

function newGame(): SaveState {
  let grid = emptyGrid();
  grid = spawnRandomTile(grid);
  grid = spawnRandomTile(grid);
  return { grid, score: 0, status: "Playing" };
}

export default function App() {
  const [game, setGame] = useState<SaveState>(() => {
  const saved = localStorage.getItem("gameState");
  if (saved) return JSON.parse(saved); 
  return newGame();                    
});

  const [history, setHistory] = useState<SaveState[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("gameState");
    if (saved) setGame(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("gameState", JSON.stringify(game));
  }, [game]);

  const restart = () => {
    const fresh = newGame();
    setGame(fresh);
    setHistory([]);
  };

  const undo = () => {
    const prev = history.at(-1);
    if (!prev) return;
    setGame(prev);
    setHistory(history.slice(0, -1));
  };

  const checkStatus = (grid: Grid): "Playing" | "Won" | "Over" => {
    if (maxTile(grid) >= 128) return "Won"; 
    if (!hasMoves(grid)) return "Over";
    return "Playing";
  };

  const handleMove = (dir: Dir) => {
    if (game.status !== "Playing") return;

    const { grid: movedGrid, moved, scoreDelta } = move(game.grid, dir);
    if (moved) {
      const withTile = spawnRandomTile(movedGrid);
      const newScore = game.score + scoreDelta;
      const newStatus = checkStatus(withTile);

      setHistory([...history, game]);
      setGame({ grid: withTile, score: newScore, status: newStatus });
    }
  };


  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") handleMove("Up");
      else if (e.key === "ArrowDown") handleMove("Down");
      else if (e.key === "ArrowLeft") handleMove("Left");
      else if (e.key === "ArrowRight") handleMove("Right");
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  });

  return (
    <div className="container">
      <div className="header">
        <h1>2048</h1>
        <div className="scoreboard">Score: {game.score}</div>
        <div className="buttons">
          <button onClick={restart}>Restart</button>
          <button onClick={undo}>Undo</button>
        </div>
      </div>

      <div className="game">
        {game.grid.map((row, r) => (
          <div className="row" key={r}>
            {row.map((cell, c) => (
              <div className={`cell value-${cell}`} key={c}>
                {cell !== 0 ? cell : ""}
              </div>
            ))}
          </div>
        ))}
      </div>

      {game.status !== "Playing" && (
        <div className="overlay">
          {game.status === "Won" ? "🎉 You win!" : "💀 Game Over!"}
          <button onClick={restart}>Play Again</button>
        </div>
      )}
    </div>
  );
}
