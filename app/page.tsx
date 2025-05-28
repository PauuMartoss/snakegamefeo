"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// Game constants
const GRID_SIZE = 20
const CELL_SIZE = 20
const GAME_SPEED = 100
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
}

export default function SnakeGame() {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }])
  const [food, setFood] = useState({ x: 5, y: 5 })
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)

  // Generate random food position
  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    }

    // Make sure food doesn't spawn on snake
    const isOnSnake = snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)
    if (isOnSnake) return generateFood()

    return newFood
  }, [snake])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted) {
        setGameStarted(true)
      }

      switch (e.key) {
        case "ArrowUp":
          if (direction !== DIRECTIONS.DOWN) setDirection(DIRECTIONS.UP)
          e.preventDefault()
          break
        case "ArrowDown":
          if (direction !== DIRECTIONS.UP) setDirection(DIRECTIONS.DOWN)
          e.preventDefault()
          break
        case "ArrowLeft":
          if (direction !== DIRECTIONS.RIGHT) setDirection(DIRECTIONS.LEFT)
          e.preventDefault()
          break
        case "ArrowRight":
          if (direction !== DIRECTIONS.LEFT) setDirection(DIRECTIONS.RIGHT)
          e.preventDefault()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [direction, gameStarted])

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const newSnake = [...prevSnake]
        const head = { ...newSnake[0] }

        // Move head in current direction
        head.x += direction.x
        head.y += direction.y

        // Check for collisions with walls
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true)
          return prevSnake
        }

        // Check for collisions with self
        if (newSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true)
          return prevSnake
        }

        // Add new head to beginning of snake
        newSnake.unshift(head)

        // Check if snake ate food
        if (head.x === food.x && head.y === food.y) {
          setFood(generateFood())
          setScore((prevScore) => prevScore + 1)
        } else {
          // Remove tail if no food was eaten
          newSnake.pop()
        }

        return newSnake
      })
    }

    const gameInterval = setInterval(moveSnake, GAME_SPEED)
    return () => clearInterval(gameInterval)
  }, [direction, food, gameOver, gameStarted, generateFood])

  // Reset game
  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }])
    setFood(generateFood())
    setDirection(DIRECTIONS.RIGHT)
    setGameOver(false)
    setScore(0)
    setGameStarted(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="p-6 bg-white rounded-lg shadow-lg">
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Google Snake</h1>
          <p className="text-gray-600">Score: {score}</p>
        </div>

        <div
          className="relative border-2 border-gray-300 rounded-md overflow-hidden"
          style={{
            width: `${GRID_SIZE * CELL_SIZE}px`,
            height: `${GRID_SIZE * CELL_SIZE}px`,
            backgroundColor: "#f0f0f0",
          }}
        >
          {/* Food */}
          <div
            className="absolute rounded-full bg-red-500"
            style={{
              width: `${CELL_SIZE - 2}px`,
              height: `${CELL_SIZE - 2}px`,
              left: `${food.x * CELL_SIZE}px`,
              top: `${food.y * CELL_SIZE}px`,
            }}
          />

          {/* Snake */}
          {snake.map((segment, index) => (
            <div
              key={index}
              className={`absolute ${index === 0 ? "bg-green-700" : "bg-green-500"} rounded-sm`}
              style={{
                width: `${CELL_SIZE - 2}px`,
                height: `${CELL_SIZE - 2}px`,
                left: `${segment.x * CELL_SIZE}px`,
                top: `${segment.y * CELL_SIZE}px`,
              }}
            />
          ))}

          {/* Game over overlay */}
          {gameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-4 rounded-md text-center">
                <h2 className="text-xl font-bold text-red-600 mb-2">Game Over!</h2>
                <p className="mb-4">Final Score: {score}</p>
                <Button onClick={resetGame}>Play Again</Button>
              </div>
            </div>
          )}

          {/* Start game overlay */}
          {!gameStarted && !gameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="bg-white p-4 rounded-md text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Snake Game</h2>
                <p className="mb-4">Press any arrow key to start</p>
                <div className="text-sm text-gray-600 mb-2">
                  <p>Use arrow keys to control the snake</p>
                  <p>Eat the red food to grow</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <Button onClick={resetGame} variant="outline" className="mr-2">
            Reset Game
          </Button>
        </div>
      </Card>
    </div>
  )
}
