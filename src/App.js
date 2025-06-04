import React, { useState } from 'react';
import './index.css';

const BOARD_SIZE = 9;

function GameModeSelector({ onSelect }) {
  return (
    <div className="flex flex-col items-center gap-4 my-8">
      <h1 className="text-3xl font-bold mb-2">Quoridor MVP</h1>
      <button
        className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition"
        onClick={() => onSelect('bot')}
      >
        Play vs Bot
      </button>
      <button
        className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 transition"
        onClick={() => onSelect('online')}
      >
        Play Online (1v1)
      </button>
    </div>
  );
}

function Board({ pawns, walls, validMoves, onMove, wallMode, validWalls, onPlaceWall }) {
  // Board cell size and wall thickness
  const CELL = 48;
  const WALL = 10;
  const WALL_LEN = CELL * 2 + 2;
  const [hoverWall, setHoverWall] = useState(null);

  return (
    <div className="relative mx-auto" style={{ width: CELL * BOARD_SIZE + WALL, height: CELL * BOARD_SIZE + WALL }}>
      {/* Board grid */}
      <div
        className="absolute left-0 top-0"
        style={{ width: CELL * BOARD_SIZE + WALL, height: CELL * BOARD_SIZE + WALL }}
      >
        {/* Draw grid lines */}
        {[...Array(BOARD_SIZE + 1)].map((_, i) => (
          <>
            {/* Horizontal */}
            <div
              key={`h${i}`}
              className="absolute bg-gray-400"
              style={{ top: i * CELL, left: 0, width: CELL * BOARD_SIZE + WALL, height: 2, zIndex: 1, borderRadius: 1 }}
            />
            {/* Vertical */}
            <div
              key={`v${i}`}
              className="absolute bg-gray-400"
              style={{ left: i * CELL, top: 0, height: CELL * BOARD_SIZE + WALL, width: 2, zIndex: 1, borderRadius: 1 }}
            />
          </>
        ))}
      </div>
      {/* Board cells */}
      <div className="absolute left-0 top-0 grid" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, ${CELL}px)`, gridTemplateRows: `repeat(${BOARD_SIZE}, ${CELL}px)` }}>
        {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, idx) => {
          const row = Math.floor(idx / BOARD_SIZE);
          const col = idx % BOARD_SIZE;
          const pawn = pawns.find(p => p.row === row && p.col === col);
          // Only highlight valid moves for the current player, not the pawn's current cell
          const isValidMove = validMoves.some(m => m.row === row && m.col === col) && !pawn;
          return (
            <div
              key={idx}
              className={`relative flex items-center justify-center bg-white transition-all duration-200 ${isValidMove && !wallMode ? 'cursor-pointer' : ''}`}
              style={{ width: CELL, height: CELL, boxSizing: 'border-box' }}
              onClick={() => isValidMove && !wallMode && onMove(row, col)}
              tabIndex={isValidMove && !wallMode ? 0 : -1}
              aria-label={pawn ? `Pawn ${pawn.player}` : `Cell ${row},${col}`}
            >
              {/* Blue move highlight overlay */}
              {isValidMove && !wallMode && (
                <div className="absolute inset-0 pointer-events-none z-10 animate-pulse" style={{borderRadius:8, boxShadow:'0 0 0 6px #3b82f6, 0 0 16px 6px #60a5fa66', transition:'box-shadow 0.2s'}} />
              )}
              {pawn && (
                <div
                  className={`w-8 h-8 rounded-full shadow-lg border-4 ${pawn.player === 1 ? 'bg-blue-500 border-blue-800' : 'bg-green-500 border-green-800'} transition-all duration-300`}
                  title={`Player ${pawn.player}`}
                />
              )}
            </div>
          );
        })}
      </div>
      {/* Placed walls */}
      {walls.map((wall, i) => (
        <div
          key={i}
          className={`absolute bg-yellow-700 shadow-xl ${wall.orientation === 'h' ? 'hover:bg-yellow-600' : 'hover:bg-yellow-600'}`}
          style={{
            left: wall.orientation === 'h'
              ? wall.col * CELL
              : wall.col * CELL - WALL / 2,
            top: wall.orientation === 'h'
              ? wall.row * CELL + CELL - WALL / 2
              : wall.row * CELL,
            width: wall.orientation === 'h' ? WALL_LEN : WALL,
            height: wall.orientation === 'h' ? WALL : WALL_LEN,
            borderRadius: WALL / 2,
            zIndex: 30,
            transition: 'all 0.2s',
          }}
        />
      ))}
      {/* Wall placement highlights */}
      {wallMode && validWalls.map((wall, i) => {
        const isHover = hoverWall && hoverWall.row === wall.row && hoverWall.col === wall.col && hoverWall.orientation === wall.orientation;
        return (
          <div
            key={i}
            className={`absolute ${isHover ? 'bg-yellow-400/80' : 'bg-yellow-300/40'} cursor-pointer transition-all duration-150`}
            style={{
              left: wall.col * CELL + (wall.orientation === 'h' ? 0 : CELL - WALL / 2),
              top: wall.row * CELL + (wall.orientation === 'h' ? CELL - WALL / 2 : 0),
              width: wall.orientation === 'h' ? WALL_LEN : WALL,
              height: wall.orientation === 'h' ? WALL : WALL_LEN,
              borderRadius: WALL / 2,
              zIndex: 40,
              boxShadow: isHover ? '0 0 8px 2px #facc15' : 'none',
            }}
            onMouseEnter={() => setHoverWall(wall)}
            onMouseLeave={() => setHoverWall(null)}
            onClick={() => onPlaceWall(wall)}
            tabIndex={0}
            aria-label={`Place wall ${wall.orientation === 'h' ? 'horizontally' : 'vertically'} at ${wall.row},${wall.col}`}
          />
        );
      })}
      {/* Ghost wall on hover */}
      {wallMode && hoverWall && (
        <div
          className="absolute pointer-events-none bg-yellow-400/80 animate-pulse"
          style={{
            left: hoverWall.col * CELL + (hoverWall.orientation === 'h' ? 0 : CELL - WALL / 2),
            top: hoverWall.row * CELL + (hoverWall.orientation === 'h' ? CELL - WALL / 2 : 0),
            width: hoverWall.orientation === 'h' ? WALL_LEN : WALL,
            height: hoverWall.orientation === 'h' ? WALL : WALL_LEN,
            borderRadius: WALL / 2,
            zIndex: 50,
            opacity: 0.7,
            boxShadow: '0 0 16px 4px #facc15',
          }}
        />
      )}
    </div>
  );
}



function getValidPawnMoves(pawns, walls, player) {
  // Allow orthogonal moves, block only if a wall segment is DIRECTLY between the cells
  const me = pawns.find(p => p.player === player);
  const others = pawns.filter(p => p.player !== player);
  const moves = [];
  const directions = [
    { dr: -1, dc: 0 }, // up
    { dr: 1, dc: 0 },  // down
    { dr: 0, dc: -1 }, // left
    { dr: 0, dc: 1 },  // right
  ];
  for (const { dr, dc } of directions) {
    const nr = me.row + dr;
    const nc = me.col + dc;
    // Check board bounds
    if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) continue;
    // Check for pawn collision
    if (others.some(p => p.row === nr && p.col === nc)) continue;
    // Only block if a wall segment is directly between from and to
    if (!isMoveBlocked({ row: me.row, col: me.col }, { row: nr, col: nc }, walls)) {
      moves.push({ row: nr, col: nc });
    }
  }
  return moves;
}

function shortestPath(start, goalRows, walls, pawns) {
  // BFS from start to any row in goalRows (array of rows)
  const queue = [[start.row, start.col, []]];
  const visited = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(false));
  visited[start.row][start.col] = true;
  while (queue.length) {
    const [r, c, path] = queue.shift();
    if (goalRows.includes(r)) return [...path, { row: r, col: c }];
    for (const { dr, dc } of [
      { dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }
    ]) {
      const nr = r + dr, nc = c + dc;
      if (
        nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE &&
        !visited[nr][nc] &&
        !isMoveBlocked({ row: r, col: c }, { row: nr, col: nc }, walls) &&
        !pawns.some(p => p.row === nr && p.col === nc)
      ) {
        visited[nr][nc] = true;
        queue.push([nr, nc, [...path, { row: r, col: c }]]);
      }
    }
  }
  return null;
}

function smartBotMove(pawns, walls, wallCount) {
  // 1. Always try to move toward goal with shortest path
  const bot = pawns.find(p => p.player === 2);
  const player = pawns.find(p => p.player === 1);
  const botGoal = [BOARD_SIZE - 1];
  const playerGoal = [0];
  const botPath = shortestPath(bot, botGoal, walls, pawns);
  const playerPath = shortestPath(player, playerGoal, walls, pawns);
  // 2. If player path is strictly shorter and bot has walls, try to place a wall to slow player
  if (
    wallCount[2] > 0 && playerPath && botPath && playerPath.length < botPath.length
  ) {
    // Try more wall options along player's path
    for (let i = 1; i < Math.min(playerPath.length - 1, 6); i++) {
      const spot = playerPath[i];
      for (const orientation of ['h', 'v']) {
        const wall = { row: spot.row, col: spot.col, orientation };
        if (!isWallOverlap(walls, wall) && !isWallBlocksPath(walls, pawns, wall)) {
          return { type: 'wall', wall };
        }
      }
    }
  }
  // 1. If bot can move, take next step on shortest path
  if (botPath && botPath.length > 1) {
    return { type: 'move', row: botPath[1].row, col: botPath[1].col };
  }
  // 4. Or do nothing
  return null;
}

function randomBotMove(pawns, walls) {
  // Returns a random valid move for the bot (used for fallback/testing)
  const moves = getValidPawnMoves(pawns, walls, 2);
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

function isMoveBlocked(from, to, walls) {
  // Returns true if a wall segment is directly between from and to
  const dr = to.row - from.row;
  const dc = to.col - from.col;
  for (const wall of walls) {
    if (wall.orientation === 'h') {
      // Horizontal wall blocks vertical movement between its columns
      // Upward move
      if (
        dr === -1 && dc === 0 &&
        from.row === wall.row + 1 &&
        from.col >= wall.col && from.col < wall.col + 2
      ) return true;
      // Downward move
      if (
        dr === 1 && dc === 0 &&
        from.row === wall.row &&
        from.col >= wall.col && from.col < wall.col + 2
      ) return true;
    } else if (wall.orientation === 'v') {
      // Vertical wall blocks horizontal movement between its rows
      // Left move
      if (
        dc === -1 && dr === 0 &&
        from.col === wall.col + 1 &&
        from.row >= wall.row && from.row < wall.row + 2
      ) return true;
      // Right move
      if (
        dc === 1 && dr === 0 &&
        from.col === wall.col &&
        from.row >= wall.row && from.row < wall.row + 2
      ) return true;
    }
  }
  return false;
}

// --- Wall helper functions must be defined before any use ---
function isWallOverlap(walls, wall) {
  // Prevent overlap, crossing, and adjacent/colinear walls (strict Quoridor rules)
  return walls.some(w => {
    // Overlap: same position and orientation
    if (w.orientation === wall.orientation && w.row === wall.row && w.col === wall.col) return true;
    // Crossing: horizontal and vertical at same spot
    if (w.orientation !== wall.orientation) {
      if (wall.orientation === 'h' && w.orientation === 'v') {
        return w.row === wall.row && w.col === wall.col;
      }
      if (wall.orientation === 'v' && w.orientation === 'h') {
        return w.row === wall.row && w.col === wall.col;
      }
    }
    // Adjacent/colinear: two horizontal walls side-by-side, or two vertical walls stacked
    if (w.orientation === wall.orientation) {
      if (wall.orientation === 'h' && w.row === wall.row && Math.abs(w.col - wall.col) === 1) return true;
      if (wall.orientation === 'v' && w.col === wall.col && Math.abs(w.row - wall.row) === 1) return true;
    }
    return false;
  });
}

function isWallBlocksPath(walls, pawns, newWall) {
  // Check if adding newWall blocks either player from reaching their goal (BFS)
  const tempWalls = [...walls, newWall];
  function bfs(startRow, startCol, goalRow) {
    const visited = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(false));
    const queue = [[startRow, startCol]];
    visited[startRow][startCol] = true;
    while (queue.length) {
      const [r, c] = queue.shift();
      if (r === goalRow) return true;
      for (const { dr, dc } of [
        { dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }
      ]) {
        const nr = r + dr, nc = c + dc;
        if (
          nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE &&
          !visited[nr][nc] &&
          !isMoveBlocked({ row: r, col: c }, { row: nr, col: nc }, tempWalls)
        ) {
          visited[nr][nc] = true;
          queue.push([nr, nc]);
        }
      }
    }
    return false;
  }
  // If both players have a path, wall does not block all paths
  return !(
    bfs(pawns[0].row, pawns[0].col, 0) && bfs(pawns[1].row, pawns[1].col, BOARD_SIZE - 1)
  );
}

function getAllValidWalls(walls, pawns) {
  // Returns all valid wall placements (not overlapping or crossing)
  const valid = [];
  for (let row = 0; row < BOARD_SIZE - 1; row++) {
    for (let col = 0; col < BOARD_SIZE - 1; col++) {
      for (const orientation of ['h', 'v']) {
        const wall = { row, col, orientation };
        if (!isWallOverlap(walls, wall)) {
          valid.push(wall);
        }
      }
    }
  }
  return valid;
}

function checkWin(pawns) {
  // Player 1 wins if row === 0, Player 2 wins if row === 8
  if (pawns[0].row === 0) return 1;
  if (pawns[1].row === 8) return 2;
  return null;
}

function QuoridorGame({ mode }) {
  const [pawns, setPawns] = useState([
    { player: 1, row: 8, col: 4 },
    { player: 2, row: 0, col: 4 },
  ]);
  const [walls, setWalls] = useState([]);
  const [turn, setTurn] = useState(1); // 1: player, 2: bot/other
  const [wallMode, setWallMode] = useState(false);
  const [wallCount, setWallCount] = useState({ 1: 10, 2: 10 });
  const [winner, setWinner] = useState(null);

  const validMoves = !wallMode && !winner ? getValidPawnMoves(pawns, walls, turn) : [];
  const validWalls = wallMode && !winner && wallCount[turn] > 0 ? getAllValidWalls(walls, pawns) : [];

  // Handle player move
  function handleMove(row, col) {
    setPawns(prev => prev.map(p => p.player === turn ? { ...p, row, col } : p));
    setTurn(turn === 1 ? 2 : 1);
  }

  // Handle wall placement
  const [error, setError] = useState("");
  function handlePlaceWall(wall) {
    setError("");
    if (isWallOverlap(walls, wall)) {
      setError("Wall overlaps or crosses another wall.");
      return;
    }
    if (isWallBlocksPath(walls, pawns, wall)) {
      setError("Wall would block all paths. Try another spot.");
      return;
    }
    setWalls(prev => [...prev, wall]);
    setWallCount(prev => ({ ...prev, [turn]: prev[turn] - 1 }));
    setTurn(turn === 1 ? 2 : 1);
    setWallMode(false);
  }

  // Bot makes a move after player
  React.useEffect(() => {
    if (mode === 'bot' && turn === 2 && !winner) {
      const botAction = smartBotMove(pawns, walls, wallCount);
      if (botAction) {
        setTimeout(() => {
          if (botAction.type === 'move') {
            handleMove(botAction.row, botAction.col);
          } else if (botAction.type === 'wall') {
            handlePlaceWall(botAction.wall);
          }
        }, 600);
      }
    }
  }, [turn, mode, pawns, walls, wallCount, winner]);

  // Win detection
  React.useEffect(() => {
    const w = checkWin(pawns);
    if (w) setWinner(w);
  }, [pawns]);

  return (
    <div className="flex flex-col items-center w-full min-h-screen justify-center bg-gradient-to-br from-blue-50 to-green-100 p-2">
      <div className="w-full max-w-5xl flex flex-row items-center justify-center gap-4">
        {/* Left panel: P1 walls */}
        <div className="flex flex-col items-center justify-center min-w-[60px]">
          <div className="rounded-lg bg-blue-100 border-2 border-blue-400 px-2 py-3 mb-2 text-blue-700 font-bold text-lg shadow text-center">
            <span className="block text-xs mb-1">P1</span>
            <span className="text-2xl">{wallCount[1]}</span>
            <span className="block text-xs mt-1">walls</span>
          </div>
        </div>
        {/* Center: Board & controls */}
        <div className="flex flex-col items-center gap-2">
          <div className="font-bold text-lg mb-1">Mode: {mode === 'bot' ? 'vs Bot' : 'Online 1v1'}</div>
          {winner && <div className="text-green-700 bg-yellow-100 border border-yellow-400 rounded px-3 py-1 mb-2 text-center text-lg font-bold shadow">Player {winner} wins! 🎉</div>}
          <div className="flex flex-row gap-2 items-center mb-1">
            <span className="text-base">Turn:</span>
            <span className={turn === 1 ? 'text-blue-600 font-bold' : 'text-green-600 font-bold'}>
              Player {turn}{mode === 'bot' && turn === 2 ? ' (Bot)' : ''}
            </span>
          </div>
          <div className="flex gap-2 mb-1">
            <button
              aria-label="Move Pawn"
              className={`px-2 py-1 rounded text-xs ${!wallMode ? 'bg-blue-500 text-white' : 'bg-gray-200'} hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400`}
              onClick={() => setWallMode(false)}
              disabled={winner}
              tabIndex={0}
              title="Move your pawn"
            >Move Pawn</button>
            <button
              aria-label="Place Wall"
              className={`px-2 py-1 rounded text-xs ${wallMode ? 'bg-yellow-500 text-white' : 'bg-gray-200'} hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400`}
              onClick={() => setWallMode(true)}
              disabled={wallCount[turn] === 0 || winner}
              tabIndex={0}
              title="Place a wall"
            >Place Wall</button>
          </div>
          <div className="mb-1 text-xs text-gray-700 text-center max-w-xs">{wallMode ? "Click a yellow highlight to place a wall. Walls can't overlap, cross, or be adjacent to another wall." : "Click a blue highlight to move your pawn. First to the opposite side wins!"}</div>
          {error && <div className="mb-1 text-red-600 font-semibold animate-pulse text-xs text-center">{error}</div>}
          <div className="mb-1">
            <Board
              pawns={pawns}
              walls={walls}
              validMoves={validMoves}
              onMove={winner ? () => {} : handleMove}
              wallMode={wallMode}
              validWalls={validWalls}
              onPlaceWall={winner ? () => {} : handlePlaceWall}
            />
          </div>
          <div className="flex gap-2 mt-1 mb-1">
            <button aria-label="Restart Game" className="bg-gray-200 px-2 py-1 rounded text-xs hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400" onClick={() => window.location.reload()}>Restart</button>
          </div>
          <div className="text-gray-400 text-xs max-w-xl text-center">Tip: Use tab to navigate controls. Try playing vs the bot or explore wall strategies. Future: abilities & online play!</div>
        </div>
        {/* Right panel: P2 walls */}
        <div className="flex flex-col items-center justify-center min-w-[60px]">
          <div className="rounded-lg bg-green-100 border-2 border-green-400 px-2 py-3 mb-2 text-green-700 font-bold text-lg shadow text-center">
            <span className="block text-xs mb-1">P2</span>
            <span className="text-2xl">{wallCount[2]}</span>
            <span className="block text-xs mt-1">walls</span>
          </div>
        </div>
      </div>
    </div>
  );
}


function App() {
  const [mode, setMode] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-100 flex flex-col items-center justify-center">
      {!mode ? (
        <GameModeSelector onSelect={setMode} />
      ) : (
        <QuoridorGame mode={mode} />
      )}
    </div>
  );
}

export default App;
