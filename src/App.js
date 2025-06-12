import React, { useState } from 'react';
import './index.css';

const BOARD_SIZE = 9;

function GameModeSelector({ onSelect }) {
  return (
    <div className="flex flex-col items-center gap-6 my-10 p-8 bg-white shadow-xl rounded-xl">
      <h1 className="text-4xl font-light text-gray-700 mb-6">Quoridor MVP</h1>
      <button
        className="bg-sky-500 text-white px-8 py-3 rounded-lg shadow-md hover:bg-sky-600 hover:shadow-lg hover:scale-105 transition-all duration-150 ease-in-out"
        onClick={() => onSelect('bot')}
      >
        Play vs Bot
      </button>
      <button
        className="bg-teal-500 text-white px-8 py-3 rounded-lg shadow-md hover:bg-teal-600 hover:shadow-lg hover:scale-105 transition-all duration-150 ease-in-out"
        onClick={() => onSelect('online')}
      >
        Play Online (1v1)
      </button>
    </div>
  );
}

function Board({ pawns, walls, validMoves, onMove, wallMode, validWalls, onPlaceWall }) {
  const CELL = 48;
  const WALL = 10;
  const WALL_LEN = CELL * 2 + 2; // Wall covers two cells and the gap
  const [hoverWall, setHoverWall] = useState(null);

  return (
    <div className="relative mx-auto bg-stone-100 rounded-xl shadow-2xl" style={{ width: CELL * BOARD_SIZE + WALL, height: CELL * BOARD_SIZE + WALL, padding: WALL / 2 }}>
      {/* Board grid - thinner and lighter lines */}
      <div
        className="absolute left-0 top-0"
        style={{ width: CELL * BOARD_SIZE + WALL, height: CELL * BOARD_SIZE + WALL }}
      >
        {[...Array(BOARD_SIZE + 1)].map((_, i) => (
          <React.Fragment key={`gridline-${i}`}>
            {/* Horizontal lines */}
            <div
              className="absolute bg-stone-300"
              style={{ top: i * CELL + WALL/2, left: WALL/2, width: CELL * BOARD_SIZE, height: 1, zIndex: 1 }}
            />
            {/* Vertical lines */}
            <div
              className="absolute bg-stone-300"
              style={{ left: i * CELL + WALL/2, top: WALL/2, height: CELL * BOARD_SIZE, width: 1, zIndex: 1 }}
            />
          </React.Fragment>
        ))}
      </div>

      {/* Board cells - no individual bg, rely on board bg, add rounding to cells for visual separation if needed */}
      <div className="absolute left-0 top-0 grid" style={{ left: WALL/2, top: WALL/2, gridTemplateColumns: `repeat(${BOARD_SIZE}, ${CELL}px)`, gridTemplateRows: `repeat(${BOARD_SIZE}, ${CELL}px)` }}>
        {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, idx) => {
          const row = Math.floor(idx / BOARD_SIZE);
          const col = idx % BOARD_SIZE;
          const pawn = pawns.find(p => p.row === row && p.col === col);
          const isValidMove = validMoves.some(m => m.row === row && m.col === col) && !pawn;
          return (
            <div
              key={idx}
              className={`relative flex items-center justify-center transition-all duration-200 rounded-sm ${isValidMove && !wallMode ? 'cursor-pointer' : ''}`}
              style={{ width: CELL, height: CELL, boxSizing: 'border-box' }}
              onClick={() => isValidMove && !wallMode && onMove(row, col)}
              tabIndex={isValidMove && !wallMode ? 0 : -1}
              aria-label={pawn ? `Pawn ${pawn.player}` : `Cell ${row},${col}`}
            >
              {/* Valid move highlight - softer, more modern */}
              {isValidMove && !wallMode && (
                <div className="absolute inset-0 pointer-events-none z-10 animate-pulse" style={{borderRadius: '4px', boxShadow:'0 0 0 3px rgba(59,130,246,0.5), 0 0 12px 3px rgba(96,165,250,0.3)', transition:'box-shadow 0.2s'}} />
              )}
              {pawn && (
                <div
                  className={`w-9 h-9 rounded-full shadow-lg border-4 transition-all duration-300 flex items-center justify-center`}
                  style={pawn.player === 1 ? { backgroundColor: '#38bdf8', borderColor: '#0284c7'} : { backgroundColor: '#34d399', borderColor: '#059669'}}
                  title={`Player ${pawn.player}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Placed walls - corrected vertical position, new color */}
      {walls.map((wall, i) => (
        <div
          key={`wall-${i}`}
          className={`absolute bg-orange-500 shadow-md hover:bg-orange-400`}
          style={{
            left: wall.orientation === 'h'
              ? wall.col * CELL + WALL/2
              : (wall.col + 1) * CELL - WALL / 2 + WALL/2, // Corrected: (wall.col + 1) * CELL for line, -WALL/2 for center, +BoardPadding for offset
            top: wall.orientation === 'h'
              ? (wall.row + 1) * CELL - WALL / 2 + WALL/2 // Corrected: (wall.row + 1) * CELL for line, -WALL/2 for center, +BoardPadding for offset
              : wall.row * CELL + WALL/2,
            width: wall.orientation === 'h' ? WALL_LEN : WALL,
            height: wall.orientation === 'h' ? WALL : WALL_LEN,
            borderRadius: WALL / 3,
            zIndex: 30,
            transition: 'all 0.2s',
          }}
        />
      ))}

      {/* Wall placement highlights - new color */}
      {wallMode && validWalls.map((wall, i) => {
        const isHover = hoverWall && hoverWall.row === wall.row && hoverWall.col === wall.col && hoverWall.orientation === wall.orientation;
        return (
          <div
            key={`validwall-${i}`}
            className={`absolute ${isHover ? 'bg-orange-500/70' : 'bg-orange-400/60'} cursor-pointer transition-all duration-150`}
            style={{
              left: wall.col * CELL + (wall.orientation === 'h' ? 0 : CELL - WALL / 2) + WALL/2,
              top: wall.row * CELL + (wall.orientation === 'h' ? CELL - WALL / 2 : 0) + WALL/2,
              width: wall.orientation === 'h' ? WALL_LEN : WALL,
              height: wall.orientation === 'h' ? WALL : WALL_LEN,
              borderRadius: WALL / 3,
              zIndex: 40,
              boxShadow: isHover ? '0 0 10px 2px #fb923c' : 'none',
            }}
            onMouseEnter={() => setHoverWall(wall)}
            onMouseLeave={() => setHoverWall(null)}
            onClick={() => onPlaceWall(wall)}
            tabIndex={0}
            aria-label={`Place wall ${wall.orientation === 'h' ? 'horizontally' : 'vertically'} at ${wall.row},${wall.col}`}
          />
        );
      })}

      {/* Ghost wall on hover - new color */}
      {wallMode && hoverWall && (
        <div
          className="absolute pointer-events-none bg-orange-500/70 animate-pulse"
          style={{
            left: hoverWall.col * CELL + (hoverWall.orientation === 'h' ? 0 : CELL - WALL / 2) + WALL/2,
            top: hoverWall.row * CELL + (hoverWall.orientation === 'h' ? CELL - WALL / 2 : 0) + WALL/2,
            width: hoverWall.orientation === 'h' ? WALL_LEN : WALL,
            height: hoverWall.orientation === 'h' ? WALL : WALL_LEN,
            borderRadius: WALL / 3,
            zIndex: 50,
            opacity: 0.7,
            boxShadow: '0 0 12px 3px #fb923c',
          }}
        />
      )}
    </div>
  );
}
function getValidPawnMoves(pawns, walls, player) {
  // Enhanced function that handles orthogonal moves, jumps, and diagonal jumps
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
    
    // Check if move is blocked by a wall
    if (isMoveBlocked({ row: me.row, col: me.col }, { row: nr, col: nc }, walls)) continue;
    
    // Check for pawn collision
    const pawnBlocking = others.find(p => p.row === nr && p.col === nc);
    
    if (!pawnBlocking) {
      // Simple move, no pawn blocking
      moves.push({ row: nr, col: nc });
    } else {
      // There's a pawn blocking, check if we can jump over
      const jumpR = nr + dr;
      const jumpC = nc + dc;
      
      // Check if jump is valid (in bounds and not blocked)
      if (
        jumpR >= 0 && jumpR < BOARD_SIZE && 
        jumpC >= 0 && jumpC < BOARD_SIZE && 
        !isMoveBlocked({ row: nr, col: nc }, { row: jumpR, col: jumpC }, walls) &&
        !pawns.some(p => p.row === jumpR && p.col === jumpC)
      ) {
        moves.push({ row: jumpR, col: jumpC });
      } 
      // If direct jump is not possible, check diagonal moves (Quoridor advanced rule)
      else {
        // Try diagonal jumps if straight jump is blocked by wall or boundary
        for (const { ddr, ddc } of directions) {
          // Skip original direction
          if (ddr === dr && ddc === dc) continue;
          
          const diagR = nr + ddr;
          const diagC = nc + ddc;
          
          // Check if diagonal move is valid
          if (
            diagR >= 0 && diagR < BOARD_SIZE && 
            diagC >= 0 && diagC < BOARD_SIZE &&
            !isMoveBlocked({ row: nr, col: nc }, { row: diagR, col: diagC }, walls) &&
            !pawns.some(p => p.row === diagR && p.col === diagC)
          ) {
            moves.push({ row: diagR, col: diagC });
          }
        }
      }
    }
  }
  
  return moves;
}

function shortestPath(start, goalRows, walls, pawns) {
  // Enhanced BFS from start to any row in goalRows (array of rows)
  const queue = [[start.row, start.col, []]];
  const visited = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(false));
  visited[start.row][start.col] = true;
  
  // Handle special case where pawn is already at goal
  if (goalRows.includes(start.row)) return [{ row: start.row, col: start.col }];
  
  // Direction vectors for movement: up, down, left, right
  const directions = [
    { dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }
  ];
  
  while (queue.length) {
    const [r, c, path] = queue.shift();
    
    // Check if we've reached a goal row
    if (goalRows.includes(r)) return [...path, { row: r, col: c }];
    
    // Create a copy of pawns excluding the current one to handle jumping
    const otherPawns = pawns.filter(p => !(p.row === start.row && p.col === start.col));
    
    for (const { dr, dc } of directions) {
      const nr = r + dr, nc = c + dc;
      
      // Basic bounds and wall checking
      if (
        nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE &&
        !visited[nr][nc] &&
        !isMoveBlocked({ row: r, col: c }, { row: nr, col: nc }, walls)
      ) {
        // Check for pawn collision and handle jumping
        const pawnBlocking = pawns.find(p => p.row === nr && p.col === nc);
        
        if (!pawnBlocking) {
          // No pawn blocking, mark as visited and add to queue
          visited[nr][nc] = true;
          queue.push([nr, nc, [...path, { row: r, col: c }]]);
        } else {
          // There's a pawn blocking, try to jump over if possible
          const jumpR = nr + dr;
          const jumpC = nc + dc;
          
          // Check if jump is valid (in bounds, no wall, no other pawn)
          if (
            jumpR >= 0 && jumpR < BOARD_SIZE && jumpC >= 0 && jumpC < BOARD_SIZE &&
            !visited[jumpR][jumpC] &&
            !isMoveBlocked({ row: nr, col: nc }, { row: jumpR, col: jumpC }, walls) &&
            !pawns.some(p => p.row === jumpR && p.col === jumpC)
          ) {
            visited[jumpR][jumpC] = true;
            queue.push([jumpR, jumpC, [...path, { row: r, col: c }]]);
          }
          // Handle diagonal jumps if straight jump is blocked - for advanced Quoridor rules
          else {
            // Try diagonal jumps if straight jump is blocked by wall or boundary
            for (const { ddr, ddc } of [
              { ddr: -1, ddc: 0 }, { ddr: 1, ddc: 0 }, { ddr: 0, ddc: -1 }, { ddr: 0, ddc: 1 }
            ]) {
              // Skip original direction
              if (ddr === dr && ddc === dc) continue;
              
              const diagR = nr + ddr;
              const diagC = nc + ddc;
              
              // Check if diagonal move is valid
              if (
                diagR >= 0 && diagR < BOARD_SIZE && diagC >= 0 && diagC < BOARD_SIZE &&
                !visited[diagR][diagC] &&
                !isMoveBlocked({ row: nr, col: nc }, { row: diagR, col: diagC }, walls) &&
                !pawns.some(p => p.row === diagR && p.col === diagC)
              ) {
                visited[diagR][diagC] = true;
                queue.push([diagR, diagC, [...path, { row: r, col: c }]]);
              }
            }
          }
        }
      }
    }
  }
  return null;
}

function evaluateGameState(pawns, walls) {
  // Enhanced evaluation function for the game state from bot's perspective
  const bot = pawns.find(p => p.player === 2);
  const player = pawns.find(p => p.player === 1);
  const botGoal = [BOARD_SIZE - 1];
  const playerGoal = [0];
  const botPath = shortestPath(bot, botGoal, walls, pawns);
  const playerPath = shortestPath(player, playerGoal, walls, pawns);
  
  // Handle terminal or near-terminal states
  if (!botPath) return -1000; // Bot has no path to goal, very bad
  if (!playerPath) return 1000; // Player has no path to goal, very good for bot
  if (botPath.length === 1) return 800; // Bot is one step away from winning
  if (playerPath.length === 1) return -800; // Player is one step away from winning
  
  // Basic evaluation: weighted difference in path lengths
  // Lower path length is better for that player
  // Weight the path length more as the game progresses
  const gameProgressFactor = Math.min(1.5, 1 + (walls.length / 20)); // 1.0 to 1.5 as game progresses
  const pathDifference = playerPath.length - botPath.length;
  let evaluation = pathDifference * gameProgressFactor;
  
  // Add positional value: prefer center positions for more flexibility
  // More important in early game, less in late game
  const centerBias = Math.max(0.1, 0.3 - (walls.length / 40)); // 0.3 to 0.1 as game progresses
  const centerValue = (4 - Math.abs(bot.col - 4)) * centerBias;
  evaluation += centerValue;
  
  // Consider mobility - having more possible moves is good
  const botMoves = getValidPawnMoves(pawns, walls, 2).length;
  const playerMoves = getValidPawnMoves(pawns, walls, 1).length;
  const mobilityValue = (botMoves - playerMoves) * 0.1;
  evaluation += mobilityValue;
  
  // Consider remaining walls as a resource
  if (pawns.length === 2 && pawns[0].player !== pawns[1].player) {
    // Assuming wallCount is accessible or can be derived
    const wallsRemaining = walls.filter(w => w.player === 2).length;
    const playerWallsRemaining = walls.filter(w => w.player === 1).length;
    
    // Having more walls than player is good, especially in close games
    if (Math.abs(pathDifference) < 3) {
      // If the game is close, walls are more valuable
      evaluation += (wallsRemaining - playerWallsRemaining) * 0.2;
    } else {
      // If game is not close, walls are less valuable
      evaluation += (wallsRemaining - playerWallsRemaining) * 0.1;
    }
  }
  
  // Territory control - check how many cells are closer to us than to opponent
  let territoryControl = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      // Skip cells with pawns
      if (pawns.some(p => p.row === r && p.col === c)) continue;
      
      // Simple distance calculation (not considering walls)
      const distToBot = Math.abs(r - bot.row) + Math.abs(c - bot.col);
      const distToPlayer = Math.abs(r - player.row) + Math.abs(c - player.col);
      
      if (distToBot < distToPlayer) {
        territoryControl += 1;
      } else if (distToBot > distToPlayer) {
        territoryControl -= 1;
      }
    }
  }
  // Scale down territory control influence
  evaluation += territoryControl * 0.01;
  
  // Consider progress toward goal
  const botProgress = (BOARD_SIZE - 1) - bot.row; // 0 to 8 (higher is better)
  const playerProgress = player.row; // 0 to 8 (higher is better)
  
  // Progress becomes more important as the game advances
  const progressWeight = 0.3 + (walls.length / 40); // 0.3 to 0.8 as game progresses
  evaluation += (botProgress - playerProgress) * progressWeight;
  
  return evaluation;
}

function identifyStrategicWallSpots(pawns, walls, player) {
  // Identify strategic spots for wall placement based on opponent's position
  // This helps the bot find good wall placements to block the opponent
  
  const opponent = pawns.find(p => p.player !== player);
  const me = pawns.find(p => p.player === player);
  const opponentGoal = player === 1 ? [BOARD_SIZE - 1] : [0];
  const myGoal = player === 1 ? [0] : [BOARD_SIZE - 1];
  
  // Get opponent's current shortest path
  const opponentPath = shortestPath(opponent, opponentGoal, walls, pawns);
  if (!opponentPath || opponentPath.length <= 2) return []; // Too close to goal or no path
  
  const strategicSpots = [];
  
  // Check for narrow corridors in opponent's path
  // These are good spots to place walls to force longer detours
  for (let i = 1; i < Math.min(opponentPath.length - 1, 5); i++) {
    const curr = opponentPath[i];
    const next = opponentPath[i + 1];
    
    // Direction of movement
    const dr = next.row - curr.row;
    const dc = next.col - curr.col;
    
    // Check if this is a critical path segment (limited alternative routes)
    let isNarrowCorridor = false;
    let alternativePaths = 0;
    
    // Check alternative adjacent cells
    const adjacentCells = [
      { row: curr.row - 1, col: curr.col }, // up
      { row: curr.row + 1, col: curr.col }, // down
      { row: curr.row, col: curr.col - 1 }, // left
      { row: curr.row, col: curr.col + 1 }, // right
    ];
    
    // Count how many alternative paths exist from this spot
    for (const cell of adjacentCells) {
      if (
        cell.row >= 0 && cell.row < BOARD_SIZE &&
        cell.col >= 0 && cell.col < BOARD_SIZE &&
        !isMoveBlocked({ row: curr.row, col: curr.col }, cell, walls) &&
        !pawns.some(p => p.row === cell.row && p.col === cell.col)
      ) {
        alternativePaths++;
      }
    }
    
    // If limited alternatives, this is a good spot to block
    isNarrowCorridor = alternativePaths <= 2;
    
    if (isNarrowCorridor) {
      // Based on direction, decide where to place the wall
      if (dr !== 0) { // Moving vertically
        // Try horizontal walls to block
        const wallRow = dr > 0 ? curr.row : next.row;
        
        // Check both positions for the horizontal wall
        if (curr.col > 0) {
          strategicSpots.push({
            row: wallRow,
            col: curr.col - 1,
            orientation: 'h',
            priority: 10 - i // Higher priority for spots closer to opponent
          });
        }
        
        strategicSpots.push({
          row: wallRow, 
          col: curr.col,
          orientation: 'h',
          priority: 10 - i
        });
      }
      
      if (dc !== 0) { // Moving horizontally
        // Try vertical walls to block
        const wallCol = dc > 0 ? curr.col : next.col;
        
        // Check both positions for the vertical wall
        if (curr.row > 0) {
          strategicSpots.push({
            row: curr.row - 1,
            col: wallCol,
            orientation: 'v',
            priority: 10 - i
          });
        }
        
        strategicSpots.push({
          row: curr.row,
          col: wallCol,
          orientation: 'v',
          priority: 10 - i
        });
      }
    }
  }
  
  // Add spots that protect my path
  const myPath = shortestPath(me, myGoal, walls, pawns);
  if (myPath && myPath.length > 2) {
    // Focus on protecting critical junctions in my path
    for (let i = 1; i < Math.min(myPath.length - 1, 4); i++) {
      const spot = myPath[i];
      
      // Check adjacent cells that could be used to block me
      const adjacentCells = [
        { row: spot.row - 1, col: spot.col },
        { row: spot.row + 1, col: spot.col },
        { row: spot.row, col: spot.col - 1 },
        { row: spot.row, col: spot.col + 1 }
      ].filter(cell => 
        cell.row >= 0 && cell.row < BOARD_SIZE && 
        cell.col >= 0 && cell.col < BOARD_SIZE &&
        !myPath.some(p => p.row === cell.row && p.col === cell.col)
      );
      
      for (const cell of adjacentCells) {
        // Try to place walls that would prevent opponent from blocking my path
        // Lower priority than blocking opponent's path
        if (cell.row < spot.row) {
          // Cell is above spot
          strategicSpots.push({
            row: cell.row,
            col: cell.col,
            orientation: 'h',
            priority: 5 - i // Lower priority
          });
        } else if (cell.row > spot.row) {
          // Cell is below spot
          strategicSpots.push({
            row: spot.row,
            col: spot.col,
            orientation: 'h',
            priority: 5 - i
          });
        } else if (cell.col < spot.col) {
          // Cell is to the left of spot
          strategicSpots.push({
            row: cell.row,
            col: cell.col,
            orientation: 'v',
            priority: 5 - i
          });
        } else if (cell.col > spot.col) {
          // Cell is to the right of spot
          strategicSpots.push({
            row: spot.row,
            col: spot.col,
            orientation: 'v',
            priority: 5 - i
          });
        }
      }
    }
  }
  
  return strategicSpots;
}

function findBestWallPlacement(pawns, walls, wallCount) {
  const player = pawns.find(p => p.player === 1);
  const bot = pawns.find(p => p.player === 2);
  const botGoal = [BOARD_SIZE - 1];
  const playerGoal = [0];
  
  // Get player's path
  const playerPath = shortestPath(player, playerGoal, walls, pawns);
  if (!playerPath || playerPath.length <= 1) return null;
  
  let bestWall = null;
  let bestEvaluation = -Infinity;
  
  // Get strategic wall placement spots using the new function
  const strategicSpots = identifyStrategicWallSpots(pawns, walls, 2); // bot is player 2
  
  // Sort the strategic spots by priority (higher priority first)
  strategicSpots.sort((a, b) => b.priority - a.priority);
  
  // Evaluate each strategic spot
  for (const spot of strategicSpots) {
    const wall = {
      row: spot.row,
      col: spot.col,
      orientation: spot.orientation
    };
    
    if (!isWallOverlap(walls, wall) && !isWallBlocksPath(walls, pawns, wall)) {
      // See how this wall affects the game state
      const tempWalls = [...walls, wall];
      const newPlayerPath = shortestPath(player, playerGoal, tempWalls, pawns);
      const botPath = shortestPath(bot, botGoal, tempWalls, pawns);
      
      // Skip if this wall makes bot's path too long or blocks it
      if (!botPath || (playerPath.length < 4 && botPath.length > playerPath.length + 3)) {
        continue;
      }
      
      // Calculate evaluation considering priority and path length changes
      let evaluation = evaluateGameState(pawns, tempWalls);
      
      // Boost evaluation based on strategic spot priority
      evaluation += spot.priority * 0.5;
      
      // Prefer walls that force a significant detour for the player
      if (newPlayerPath && playerPath) {
        const detourAmount = newPlayerPath.length - playerPath.length;
        if (detourAmount > 1) {
          evaluation += detourAmount * 2;
        }
      }
      
      // Consider wall count in evaluation - be more conservative when low on walls
      if (wallCount[2] < 3) {
        evaluation -= 5; // Significant penalty when low on walls
      } else if (wallCount[2] < 6) {
        evaluation -= 2; // Moderate penalty when medium on walls
      }
      
      if (evaluation > bestEvaluation) {
        bestEvaluation = evaluation;
        bestWall = wall;
      }
    }
  }
  
  // If no strategic spots were found effective, try blocking player's path directly
  if (!bestWall && playerPath.length > 1) {
    for (let i = 1; i < Math.min(playerPath.length - 1, 3); i++) {
      const spot = playerPath[i];
      const nextSpot = playerPath[i + 1];
      
      // Detect direction of movement
      const movingVertical = spot.row !== nextSpot.row;
      const movingDown = spot.row < nextSpot.row;
      const movingRight = spot.col < nextSpot.col;
      
      // Try wall placements that would block this move
      const wallOptions = [];
      
      if (movingVertical) {
        // For vertical movement, place horizontal walls
        const row = movingDown ? spot.row : nextSpot.row;
        wallOptions.push({ row, col: spot.col, orientation: 'h' });
        if (spot.col > 0) wallOptions.push({ row, col: spot.col - 1, orientation: 'h' });
      } else {
        // For horizontal movement, place vertical walls
        const col = movingRight ? spot.col : nextSpot.col;
        wallOptions.push({ row: spot.row, col, orientation: 'v' });
        if (spot.row > 0) wallOptions.push({ row: spot.row - 1, col, orientation: 'v' });
      }
      
      // Evaluate each wall option
      for (const wall of wallOptions) {
        if (!isWallOverlap(walls, wall) && !isWallBlocksPath(walls, pawns, wall)) {
          const tempWalls = [...walls, wall];
          const newPlayerPath = shortestPath(player, playerGoal, tempWalls, pawns);
          
          // Check if it significantly increases player's path length
          if (newPlayerPath && newPlayerPath.length > playerPath.length + 1) {
            const evaluation = evaluateGameState(pawns, tempWalls);
            
            if (evaluation > bestEvaluation) {
              bestEvaluation = evaluation;
              bestWall = wall;
            }
          }
        }
      }
    }
  }
    // Add strategic consideration: look ahead to see if the player can immediately counter
  if (bestWall && wallCount[1] > 0) {
    const tempWalls = [...walls, bestWall];
    
    // Get the bot's path with the new wall
    const botPathWithWall = shortestPath(bot, botGoal, tempWalls, pawns);
    
    // Simulate what the player might do in response
    const possibleCounterWalls = identifyStrategicWallSpots(
      pawns, 
      tempWalls,
      1 // from player's perspective
    ).slice(0, 5); // Check just a few top priority spots
    
    for (const counterSpot of possibleCounterWalls) {
      const counterWall = {
        row: counterSpot.row,
        col: counterSpot.col,
        orientation: counterSpot.orientation
      };
      
      if (!isWallOverlap(tempWalls, counterWall) && !isWallBlocksPath(tempWalls, pawns, counterWall)) {
        const afterCounterWalls = [...tempWalls, counterWall];
        const botPathAfterCounter = shortestPath(bot, botGoal, afterCounterWalls, pawns);
        
        // If player can place a wall that significantly hurts the bot, reconsider
        if (!botPathAfterCounter || (botPathWithWall && botPathAfterCounter.length > botPathWithWall.length + 3)) {
          bestEvaluation -= 5; // Significant penalty if player can counter effectively
          
          // If the counter is devastating, maybe abandon this wall
          if (bestEvaluation < 0) {
            bestWall = null;
          }
          break;
        }
      }
    }
  }
  
  return bestWall;
}

function findBestMove(pawns, walls) {
  const bot = pawns.find(p => p.player === 2);
  const botGoal = [BOARD_SIZE - 1];
  const validMoves = getValidPawnMoves(pawns, walls, 2);
  
  if (validMoves.length === 0) return null;
  
  let bestMove = null;
  let bestEvaluation = -Infinity;
  
  for (const move of validMoves) {
    // Simulate the move
    const tempPawns = pawns.map(p => 
      p.player === 2 ? { ...p, row: move.row, col: move.col } : p
    );
    
    // Prefer moves that advance toward the goal
    const evaluation = evaluateGameState(tempPawns, walls);
    
    // Add small preference for center columns for better positional flexibility
    const centerBonus = (4 - Math.abs(move.col - 4)) * 0.1;
    
    const totalEvaluation = evaluation + centerBonus;
    
    if (totalEvaluation > bestEvaluation) {
      bestEvaluation = totalEvaluation;
      bestMove = move;
    }
  }
  
  return bestMove;
}

function smartBotMove(pawns, walls, wallCount) {
  const bot = pawns.find(p => p.player === 2);
  const player = pawns.find(p => p.player === 1);
  const botGoal = [BOARD_SIZE - 1];
  const playerGoal = [0];
  const botPath = shortestPath(bot, botGoal, walls, pawns);
  const playerPath = shortestPath(player, playerGoal, walls, pawns);
  
  // Calculate the current game state evaluation
  const evaluation = evaluateGameState(pawns, walls);

  // Define the bot's strategy based on the game state
  let strategy;
  
  if (!botPath) {
    strategy = "desperate"; // Bot has no path to goal
  } else if (!playerPath) {
    strategy = "winning"; // Player has no path to goal
  } else if (playerPath.length <= 2) {
    strategy = "emergency"; // Player is about to win
  } else if (botPath.length <= 2) {
    strategy = "rush"; // Bot is about to win
  } else if (playerPath.length < botPath.length - 2) {
    strategy = "catchup"; // Player is significantly ahead
  } else if (botPath.length < playerPath.length - 2) {
    strategy = "maintain_lead"; // Bot is significantly ahead
  } else {
    strategy = "balanced"; // Game is roughly even
  }
  
  // Adapt wall usage based on remaining walls and game phase
  let wallUsageProbability;
  const gamePhase = Math.min(walls.length / 10, 1); // 0 to 1 indicating game progress
  
  switch (strategy) {
    case "emergency":
      // Must place walls if player is about to win
      if (wallCount[2] > 0) {
        const bestWall = findBestWallPlacement(pawns, walls, wallCount);
        if (bestWall) {
          return { type: 'wall', wall: bestWall };
        }
      }
      break;
      
    case "rush":
      // Just move to win, don't bother with walls
      if (botPath && botPath.length > 1) {
        return { type: 'move', row: botPath[1].row, col: botPath[1].col };
      }
      break;
      
    case "catchup":
      // High probability of using walls to slow down player
      wallUsageProbability = 0.8 - (0.4 * gamePhase);
      if (wallCount[2] > 0 && Math.random() < wallUsageProbability) {
        const bestWall = findBestWallPlacement(pawns, walls, wallCount);
        if (bestWall) {
          return { type: 'wall', wall: bestWall };
        }
      }
      break;
      
    case "maintain_lead":
      // Lower probability of using walls, focus on moving
      wallUsageProbability = 0.3;
      if (wallCount[2] > 0 && Math.random() < wallUsageProbability) {
        const bestWall = findBestWallPlacement(pawns, walls, wallCount);
        if (bestWall) {
          return { type: 'wall', wall: bestWall };
        }
      }
      break;
      
    case "balanced":
      // Medium probability of using walls, balanced approach
      wallUsageProbability = 0.5 - (0.2 * gamePhase);
      
      // Try to optimize based on remaining walls
      // Save walls if running low
      if (wallCount[2] < 3) {
        wallUsageProbability *= 0.5;
      }
      
      // If player is slightly ahead, increase wall probability
      if (playerPath.length < botPath.length) {
        wallUsageProbability += 0.2;
      }
      
      if (wallCount[2] > 0 && Math.random() < wallUsageProbability) {
        const bestWall = findBestWallPlacement(pawns, walls, wallCount);
        if (bestWall) {
          return { type: 'wall', wall: bestWall };
        }
      }
      break;
      
    case "desperate":
      // Try to clear a path for bot
      if (wallCount[2] > 0) {
        // Identify walls that might be blocking the bot
        for (let r = 0; r < BOARD_SIZE - 1; r++) {
          for (let c = 0; c < BOARD_SIZE - 1; c++) {
            for (const orientation of ['h', 'v']) {
              // Check if removing a wall would create a path
              const testWalls = walls.filter(wall => 
                !(wall.row === r && wall.col === c && wall.orientation === orientation)
              );
              const testPath = shortestPath(bot, botGoal, testWalls, pawns);
              
              if (testPath) {
                // Found a critical wall - try to place a counter-wall to open a path
                const adjacentCells = [
                  { row: r - 1, col: c },
                  { row: r + 1, col: c },
                  { row: r, col: c - 1 },
                  { row: r, col: c + 1 }
                ].filter(cell => 
                  cell.row >= 0 && cell.row < BOARD_SIZE - 1 && 
                  cell.col >= 0 && cell.col < BOARD_SIZE - 1
                );
                
                for (const cell of adjacentCells) {
                  const counterOrientation = orientation === 'h' ? 'v' : 'h';
                  const wall = { row: cell.row, col: cell.col, orientation: counterOrientation };
                  
                  if (!isWallOverlap(walls, wall) && !isWallBlocksPath(testWalls, pawns, wall)) {
                    return { type: 'wall', wall };
                  }
                }
              }
            }
          }
        }
      }
      break;
      
    case "winning":
      // Just move to win, no need for walls
      if (botPath && botPath.length > 1) {
        return { type: 'move', row: botPath[1].row, col: botPath[1].col };
      }
      break;
  }
  
  // If we didn't decide on a wall placement, make the best possible move
  // First check if we can use a more advanced path finding for the move
  const bestMove = findBestMove(pawns, walls);
  if (bestMove) {
    return { type: 'move', row: bestMove.row, col: bestMove.col };
  }
  
  // Fallback to simple path-following
  if (botPath && botPath.length > 1) {
    return { type: 'move', row: botPath[1].row, col: botPath[1].col };
  }
  
  // Last resort: try any valid move
  const validMoves = getValidPawnMoves(pawns, walls, 2);
  if (validMoves.length > 0) {
    // Sort by distance to goal
    validMoves.sort((a, b) => 
      Math.abs(a.row - (BOARD_SIZE - 1)) - Math.abs(b.row - (BOARD_SIZE - 1))
    );
    return { type: 'move', row: validMoves[0].row, col: validMoves[0].col };
  }
  
  // Ultimate fallback: skip turn (should never happen in valid Quoridor)
  return { type: 'skip' };
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
          !isMoveBlocked({ row: r, col: c }, { row: nr, col: nc }, tempWalls) &&
          !pawns.some(p => p.row === nr && p.col === nc)
        ) {
          visited[nr][nc] = true;
          queue.push([nr, nc]);
        }
      }
    }
    return false;
  }
  
  // Player 1 needs to reach row 0, Player 2 needs to reach row 8
  const player1 = pawns.find(p => p.player === 1);
  const player2 = pawns.find(p => p.player === 2);
  
  const player1CanReachGoal = bfs(player1.row, player1.col, 0);
  const player2CanReachGoal = bfs(player2.row, player2.col, BOARD_SIZE - 1);
  
  // Wall blocks path if either player cannot reach their goal
  return !player1CanReachGoal || !player2CanReachGoal;
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
      
      setTimeout(() => {
        if (botAction && botAction.type === 'move') {
          handleMove(botAction.row, botAction.col);
        } else if (botAction && botAction.type === 'wall') {
          handlePlaceWall(botAction.wall);
        } else {
          // Skip turn if no action or skip action - advance turn to player
          setTurn(1);
        }
      }, 600);
    }
  }, [turn, mode, pawns, walls, wallCount, winner]);

  // Win detection
  React.useEffect(() => {
    const w = checkWin(pawns);
    if (w) setWinner(w);
  }, [pawns]);

  return (
    <div className="flex flex-col items-center w-full min-h-screen justify-start pt-8 bg-gradient-to-br from-slate-100 to-sky-100 p-4 selection:bg-sky-200 selection:text-sky-900">
      <div className="w-full max-w-6xl flex flex-row items-start justify-center gap-8">
        {/* Left panel: P1 walls */}
        <div className="flex flex-col items-center justify-start pt-20 min-w-[100px]">
          <div className="rounded-xl bg-sky-100/80 border border-sky-300 px-4 py-3 text-sky-700 font-medium text-lg shadow-lg text-center sticky top-8">
            <span className="block text-sm mb-1 text-sky-600">Player 1</span>
            <span className="text-4xl font-bold text-sky-600">{wallCount[1]}</span>
            <span className="block text-xs mt-1 text-sky-500">walls left</span>
          </div>
        </div>

        {/* Center: Board & controls */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-xl font-light text-gray-600">Mode: {mode === 'bot' ? 'vs Bot' : 'Online 1v1'}</div>
          
          {winner && 
            <div className="bg-yellow-200/70 border border-yellow-500 text-yellow-800 rounded-lg px-6 py-3 my-2 text-xl font-semibold shadow-md text-center">
              Player {winner} wins! 🎉
            </div>
          }
          
          {!winner && (
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-lg text-gray-700">Turn:</span>
              <span className={`font-semibold text-2xl ${turn === 1 ? 'text-sky-600' : 'text-emerald-600'}`}>
                Player {turn}{mode === 'bot' && turn === 2 ? ' (Bot)' : ''}
              </span>
            </div>
          )}

          <div className="flex gap-3 mb-3">
            <button
              aria-label="Move Pawn"
              className={`px-5 py-2 rounded-md text-sm font-medium shadow focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed ${!wallMode ? 'bg-sky-500 text-white hover:bg-sky-600 focus:ring-sky-400' : 'bg-slate-200 text-slate-700 hover:bg-slate-300 focus:ring-slate-400'}`}
              onClick={() => setWallMode(false)}
              disabled={!!winner}
              tabIndex={0}
              title="Move your pawn"
            >Move Pawn</button>
            <button
              aria-label="Place Wall"
              className={`px-5 py-2 rounded-md text-sm font-medium shadow focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed ${wallMode ? 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-400' : 'bg-slate-200 text-slate-700 hover:bg-slate-300 focus:ring-slate-400'}`}
              onClick={() => setWallMode(true)}
              disabled={wallCount[turn] === 0 || !!winner}
              tabIndex={0}
              title="Place a wall"
            >Place Wall</button>
          </div>
          
          <div className="mb-2 text-sm text-gray-600 text-center max-w-md min-h-[40px]">
            {wallMode ? "Click an orange highlight to place a wall. Walls cannot overlap or completely block a player." : "Click a blue highlight to move your pawn. Reach the opposite side to win!"}
          </div>
          
          {error && <div className="mb-2 text-red-500 font-medium text-sm animate-pulse min-h-[20px]">{error}</div>}
          
          <div className="mb-4">
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
          
          <div className="flex gap-3 mt-2 mb-4">
            <button 
              aria-label="Restart Game" 
              className="bg-slate-500 hover:bg-slate-600 text-white px-5 py-2 rounded-md text-sm font-medium shadow focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-colors duration-150"
              onClick={() => window.location.reload()}
            >
              Restart Game
            </button>
          </div>
          
          <div className="text-xs text-gray-500 max-w-lg text-center">
            Quoridor MVP - Strategic board game of pawns and walls.
          </div>
        </div>

        {/* Right panel: P2 walls */}
        <div className="flex flex-col items-center justify-start pt-20 min-w-[100px]">
          <div className="rounded-xl bg-emerald-100/80 border border-emerald-300 px-4 py-3 text-emerald-700 font-medium text-lg shadow-lg text-center sticky top-8">
            <span className="block text-sm mb-1 text-emerald-600">Player 2{mode === 'bot' ? ' (Bot)' : ''}</span>
            <span className="text-4xl font-bold text-emerald-600">{wallCount[2]}</span>
            <span className="block text-xs mt-1 text-emerald-500">walls left</span>
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
