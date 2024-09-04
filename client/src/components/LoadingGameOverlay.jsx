import { useEffect, useState, useRef } from "react";
import { useSocket } from "@/context/SocketProvider";

const CELL_SIZE = 20;
const SNAKE_SPEED = 150;
const WIGGLE_FREQUENCY = 0.1;
const WIGGLE_AMPLITUDE = 5;

const LoaderOverlay = ({ isOpen, type }) => {
  const { socket } = useSocket();
  const [loaderText, setLoaderText] = useState(
    "It will take around 60 seconds to complete"
  );
  const [snake, setSnake] = useState([]);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState({ x: 0, y: 0 });
  const [gameStarted, setGameStarted] = useState(false);

  const canvasRef = useRef(null);
  const [gridSize, setGridSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateGridSize = () => {
      const newGridSize = {
        width: Math.floor(window.innerWidth / CELL_SIZE),
        height: Math.floor(window.innerHeight / CELL_SIZE),
      };
      setGridSize(newGridSize);

      // Spawn snake randomly when grid size is updated
      const newSnake = [{
        x: Math.floor(Math.random() * newGridSize.width),
        y: Math.floor(Math.random() * newGridSize.height),
      }];
      setSnake(newSnake);

      // Spawn food randomly, ensuring it's not on the snake
      spawnFood(newSnake, newGridSize);
    };

    updateGridSize();
    window.addEventListener("resize", updateGridSize);
    return () => window.removeEventListener("resize", updateGridSize);
  }, []);

  const spawnFood = (currentSnake, currentGridSize) => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * currentGridSize.width),
        y: Math.floor(Math.random() * currentGridSize.height),
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    setFood(newFood);
  };

  useEffect(() => {
    if (socket) {
      socket.on("error", ({ error }) => console.error("Error:", error));
      socket.on("progress", ({ message }) => setLoaderText(message));
      socket.on("project_started", ({ slug }) => setIsLoading(false));

      return () => {
        socket.off("error");
        socket.off("progress");
        socket.off("project_started");
      };
    }
  }, [socket]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === "Space" && !gameStarted) setGameStarted(true);
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameStarted]);

  useEffect(() => {
    if (!gameStarted) return;

    const ctx = canvasRef.current.getContext("2d");
    const { width, height } = gridSize;

    const gameLoop = setInterval(() => {
      ctx.clearRect(0, 0, width * CELL_SIZE, height * CELL_SIZE);

      // Move snake
      const newSnake = [...snake];
      const head = {
        x: (newSnake[0].x + direction.x + width) % width,
        y: (newSnake[0].y + direction.y + height) % height,
      };
      newSnake.unshift(head);

      // Check if snake ate food
      if (head.x === food.x && head.y === food.y) {
        spawnFood(newSnake, gridSize);
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);

      // Draw snake with wiggle effect
      ctx.fillStyle = "white";
      newSnake.forEach((segment, index) => {
        const wiggleOffset =
          Math.sin(index * WIGGLE_FREQUENCY) * WIGGLE_AMPLITUDE;
        ctx.fillRect(
          segment.x * CELL_SIZE + wiggleOffset,
          segment.y * CELL_SIZE,
          CELL_SIZE,
          CELL_SIZE
        );
      });

      // Draw food
      ctx.fillStyle = "red";
      ctx.fillRect(
        food.x * CELL_SIZE,
        food.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    }, SNAKE_SPEED);

    return () => clearInterval(gameLoop);
  }, [snake, direction, food, gameStarted, gridSize]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowUp":
          setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex bg-black overflow-hidden z-50"> // Updated z-index
      <canvas
        ref={canvasRef}
        width={gridSize.width * CELL_SIZE}
        height={gridSize.height * CELL_SIZE}
        className="absolute inset-0"
      />
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center text-white z-[51] p-4 transition-opacity duration-300 ${
          gameStarted ? "opacity-30" : "opacity-100"
        }`}
      >
        <h2 className="text-5xl font-extrabold text-center leading-tight bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
          {type === "portfolio"
            ? "Crafting Your Portfolio"
            : "Building Your Landing Page"}
        </h2>
        {/* <p className="text-xl text-center mt-6 max-w-2xl">{loaderText}</p> */}
        {!gameStarted && (
          <p className="text-2xl font-semibold text-center mt-4 animate-pulse">
            Press Space if bored already
          </p>
        )}
      </div>
    </div>
  );
};

export default LoaderOverlay;
