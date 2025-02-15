import React, { useState, useEffect, useCallback } from 'react';
import { Gamepad, RotateCcw, Pause, Play } from 'lucide-react';

type Position = {
  x: number;
  y: number;
};

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

function App() {
  const GRID_SIZE = 20;
  const CELL_SIZE = 20;
  const INITIAL_SPEED = 150;
  
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    setFood(newFood);
  }, []);

  const resetGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection('RIGHT');
    setIsGameOver(false);
    setScore(0);
    generateFood();
    setIsPaused(false);
  }, [generateFood]);

  const checkCollision = (head: Position): boolean => {
    // Wall collision
    if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE
    ) {
      return true;
    }

    // Self collision
    return snake.some((segment, index) => {
      if (index === 0) return false;
      return segment.x === head.x && segment.y === head.y;
    });
  };

  const moveSnake = useCallback(() => {
    if (isPaused || isGameOver) return;

    setSnake((prevSnake) => {
      const head = { ...prevSnake[0] };

      switch (direction) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      if (checkCollision(head)) {
        setIsGameOver(true);
        if (score > highScore) {
          setHighScore(score);
        }
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      // Check if snake ate food
      if (head.x === food.x && head.y === food.y) {
        setScore((prev) => prev + 10);
        generateFood();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food.x, food.y, generateFood, isGameOver, isPaused, score, highScore]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isGameOver) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
        case ' ':
          setIsPaused((prev) => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, isGameOver]);

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, INITIAL_SPEED);
    return () => clearInterval(gameLoop);
  }, [moveSnake]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <div className="mb-4 flex items-center gap-2">
        <Gamepad className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Snake Game</h1>
      </div>

      <div className="mb-4 flex gap-8">
        <div className="text-center">
          <p className="text-gray-400">Score</p>
          <p className="text-xl font-bold">{score}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400">High Score</p>
          <p className="text-xl font-bold">{highScore}</p>
        </div>
      </div>

      <div className="relative">
        <div
          className="bg-gray-800 border-2 border-gray-700 rounded-lg overflow-hidden"
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
          }}
        >
          {/* Food */}
          <div
            className="absolute bg-red-500 rounded-full"
            style={{
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              left: food.x * CELL_SIZE,
              top: food.y * CELL_SIZE,
            }}
          />

          {/* Snake */}
          {snake.map((segment, index) => (
            <div
              key={index}
              className="absolute bg-green-500 rounded-sm"
              style={{
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                left: segment.x * CELL_SIZE,
                top: segment.y * CELL_SIZE,
                backgroundColor: index === 0 ? '#22c55e' : '#4ade80',
              }}
            />
          ))}

          {/* Game Over Overlay */}
          {isGameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
                <button
                  onClick={resetGame}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 mx-auto"
                >
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          {isPaused ? (
            <>
              <Play className="w-4 h-4" />
              Resume
            </>
          ) : (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          )}
        </button>
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      <div className="mt-6 text-gray-400 text-center">
        <p>Use arrow keys to move</p>
        <p>Press space to pause/resume</p>
      </div>
    </div>
  );
}

export default App;