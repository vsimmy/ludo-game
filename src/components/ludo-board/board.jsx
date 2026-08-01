import StartingStation from "./startingStation/startingStation";
import "./board.css";
import { useState, useRef, useMemo, useEffect } from "react";
import { ColorsDict } from "../ludo.type.ts";
import { PieceColor } from "../ludo.type.ts";
import Piece from "../piece/piece.jsx";
import PlayersConfig from "../players-config/players-config.jsx"
import { useWs } from "../../hooks/ws-hook.jsx"

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8080'

const Board = () => {

  const numPlayers = 4
  const initPositions = Object.values(PieceColor).reduce((acc, key) => {
    acc[key] = [null, null, null, null]
    return acc
  }, {})

  const [gameStarted, setGameStarted] = useState(false)
  const [round, setRound] = useState(0);
  const [currentTurnInd, setCurrentTurnInd] = useState(-1);
  const [currentRoll, setCurrentRoll] = useState(0);
  const [gameLog, setGameLog] = useState([]);
  const [roundDisplay, setRoundDisplay] = useState('Click to Start the Game');
  const [showGameLog, setShowGameLog] = useState(false);
  const [sixRoll, setSixRoll] = useState(0);
  const [piecePositions, setPiecePositions] = useState(initPositions);
  // Purely visual: mirrors piecePositions but catches up one square at a time so pieces
  // appear to hop spot-by-spot instead of teleporting straight to the final result.
  // piecePositions itself updates immediately and stays authoritative for all game logic
  // (clicks, turn order, win checks) — this is a rendering-only layer.
  const [animatedPositions, setAnimatedPositions] = useState(initPositions);
  const animationTimersRef = useRef({});
  const [hasPieceSelected, setHasPieceSelected] = useState(false);
  const [goHome, setGoHome] = useState(false);
  const [lastMovedPiece, setLastMovedPiece] = useState(null); // { color, pieceId } — tracks which piece to send home on 3 consecutive sixes
  const [isHovered, setIsHovered] = useState(false);
  const [winner, setWinner] = useState(null);

  // Multiplayer sync: mirrors full game state to any other connected client via
  // ws-server.js. This is a "shared state broadcast", not an authoritative server —
  // there's no per-connection identity, room isolation, or move validation on the
  // server side yet. Fine for local/offline testing with someone on the same
  // network; NOT yet safe for a public shareable URL (see server-side comment).
  const { isConnected, connectionState, gameState, sendGameState } = useWs(WS_URL)
  const isApplyingRemoteRef = useRef(false)

  const length = 13
  // Each cell in the rows below is a slot code string: "type-rotationPercent-color-slotNumber"
  //   type:     't' triangle (corner/entrance marker), 'r' or 'p' rectangle (ordinary path
  //             square — 'p' just renders slightly differently), 's' square-finish (private
  //             lane cell, slotNumber here is "color-N" not a shared number), 'j' jump arrow
  //             (decorative only, not a real numbered slot), '' empty (outside the board cross)
  //   rotationPercent: 0/25/50/75, converted to degrees for CSS rotate — controls which way
  //             corner/arrow graphics point
  //   color:    single-letter — b=blue, g=green, y=orange, r=red, ''=transparent
  //   slotNumber: 1-48 for ordinary path cells (shared numbering all the way around the
  //             board), or omitted for 'j' cells, or "color-N" (1-5) for 's' finish cells
  // To add more squares: extend a row (or add rows) with correctly-numbered cells following
  // this scheme, then update mainPathLength/terminalSlots/CROSS_BOARD_OFFSET above to match
  // the new geometry — those are the only other places board size is assumed.
  const firstRow = ['', '', '', 't-25-b-31', 'r-50-g-32', 'r-50-r-33', 'r-0-y-34', 'r-50-b-35', 'r-50-g-36', 't-50-r-37', '', '', ''];
  const secondRow = ['', '', '', 'r-0-y-30', '', '', 's-0-y-1', '', '', 'r-0-y-38', '', '', ''];
  const thirdRow = ['', '', '', 'r-0-r-29', '', '', 's-0-y-2', '', '', 'r-0-b-39', '', '', ''];
  const fourthRow = ['t-25-g-25', 'r-50-r-26', 'r-50-y-27', 'p-0-g-28', 'j-0-g', 'j-0-g', 's-0-y-3', 'j-0-g', 'j-0-g', 'p-0-r-40', 'r-50-y-41', 'r-50-b-42', 't-50-g-43'];
  const fifthRow = ['r-0-b-24', '', '', 'j-50-b', '', '', 's-0-y-4', '', '', 'j-50-r', '', '', 'r-0-r-44'];
  const sixthRow = ['r-0-y-23', '', '', 'j-50-b', '', '', 's-0-y-5', '', '', 'j-50-r', '', '', 'r-0-y-45'];
  const seventhRow = ['r-0-r-22', 's-0-r-1', 's-0-r-2', 's-0-r-3', 's-0-r-4', 's-0-r-5', '', '', 's-0-b-5', 's-0-b-4', 's-0-b-3', 's-0-b-2', 's-0-b-1', 'r-0-b-46'];

  const eighthRow = ['r-0-g-21', '', '', 'j-50-b', '', '', 's-0-g-5', '', '', 'j-50-r', '', '', 'r-0-g-47'];
  const ninthRow = ['r-0-b-20', '', '', 'j-50-b', '', '', 's-0-g-4', '', '', 'j-50-r', '', '', 'r-0-r-48'];
  const tenthRow = ['t-0-y-19', 'r-50-r-18', 'r-50-g-17', 'p-0-b-16', 'j-0-y', 'j-0-y', 's-0-g-3', 'j-0-y', 'j-0-y', 'p-0-y-4', 'r-50-g-3', 'r-50-b-2', 't-75-y-1'];
  const eleventhRow = ['', '', '', 'r-0-r-15', '', '', 's-0-g-2', '', '', 'r-0-b-5', '', '', ''];
  const twelvethRow = ['', '', '', 'r-0-g-14', '', '', 's-0-g-1', '', '', 'r-0-g-6', '', '', '']
  const thirteenthRow = ['', '', '', 't-0-b-13', 'r-50-y-12', 'r-50-r-11', 'r-0-g-10', 'r-50-b-9', 'r-50-y-8', 't-75-r-7', '', '', ''];
  const startBoard = [
    firstRow,
    secondRow,
    thirdRow,
    fourthRow,
    fifthRow,
    sixthRow,
    seventhRow,
    eighthRow,
    ninthRow,
    tenthRow,
    eleventhRow,
    twelvethRow,
    thirteenthRow
  ];

  const mainPathLength = (length - 1) * numPlayers; // 48 numbered slots around the board
  const MOVE_STEP_DURATION_MS = 500 // ms per square of animated piece movement — edit to change speed

  // Step animatedPositions toward piecePositions one square at a time whenever the
  // authoritative state changes. Only meaningful for plain-number-to-plain-number moves
  // along the shared main path (the common dice-roll case) — leaving home, entering the
  // private finish lane, and winning aren't representable as "walk N squares forward" so
  // those snap directly instead of stepping.
  useEffect(() => {
    Object.keys(piecePositions).forEach(color => {
      piecePositions[color].forEach((newPos, idx) => {
        const key = `${color}-${idx}`
        const oldPos = animatedPositions[color][idx]
        if (oldPos === newPos) return
        if (animationTimersRef.current[key]) {
          clearTimeout(animationTimersRef.current[key])
        }
        const bothNumeric = typeof oldPos === 'number' && typeof newPos === 'number'
        if (!bothNumeric) {
          setAnimatedPositions(prev => {
            const updated = JSON.parse(JSON.stringify(prev))
            updated[color][idx] = newPos
            return updated
          })
          return
        }
        // Walk forward one slot at a time (wrapping around mainPathLength) from oldPos to newPos.
        const steps = []
        let cursor = oldPos
        for (let i = 0; i < mainPathLength; i++) {
          if (cursor === newPos) break
          cursor = (cursor % mainPathLength) + 1
          steps.push(cursor)
        }
        steps.forEach((stepPos, i) => {
          animationTimersRef.current[key] = setTimeout(() => {
            setAnimatedPositions(prev => {
              const updated = JSON.parse(JSON.stringify(prev))
              updated[color][idx] = stepPos
              return updated
            })
          }, MOVE_STEP_DURATION_MS * (i + 1))
        })
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [piecePositions])
  const FINISH_LANE_LENGTH = 5 // private home-stretch cells per color, gate to center
  const CROSS_BOARD_OFFSET = 15 // slots to add when a piece crosses via its color's special jump slot
  // ^ Both constants are specific to this board's current 13x13 / 4-arm geometry.
  // If you extend the board (longer arms, more/fewer players), these will need
  // recalculating by hand — they aren't derived from `length`/`numPlayers` because
  // that derivation isn't verified to generalize. See slot-code format below for how
  // startBoard's row strings are structured if you're adding squares.

  // Broadcast our game state to other connected clients whenever it changes locally.
  useEffect(() => {
    if (!gameStarted) return
    if (isApplyingRemoteRef.current) {
      // This change came from an incoming remote update — don't echo it back.
      isApplyingRemoteRef.current = false
      return
    }
    sendGameState({
      piecePositions, currentTurnInd, currentRoll, round, roundDisplay,
      sixRoll, winner, lastMovedPiece, goHome
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [piecePositions, currentTurnInd, currentRoll, round, roundDisplay, sixRoll, winner])

  // Apply state received from another connected client.
  useEffect(() => {
    if (!gameState) return
    isApplyingRemoteRef.current = true
    setPiecePositions(gameState.piecePositions)
    setCurrentTurnInd(gameState.currentTurnInd)
    setCurrentRoll(gameState.currentRoll)
    setRound(gameState.round)
    setRoundDisplay(gameState.roundDisplay)
    setSixRoll(gameState.sixRoll)
    setWinner(gameState.winner)
    setLastMovedPiece(gameState.lastMovedPiece)
    setGoHome(gameState.goHome)
    if (!gameStarted) setGameStarted(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState])

  // Precomputed slotNum -> color lookup, derived once from startBoard itself
  // (replaces reading document.getElementById(...).style.backgroundColor at runtime,
  // which was fragile and the likely cause of the late-game freeze/hang).
  const slotColorMap = useMemo(() => {
    const map = {}
    startBoard.forEach(row => {
      row.forEach(code => {
        if (!code) return
        const parsed = parseSlot(code)
        if (parsed.type !== 'jump' && parsed.slotNum !== null && !parsed.slotNum.toString().includes('-')) {
          map[parsed.slotNum] = parsed.color
        }
      })
    })
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const terminalSlots = Object.keys(PieceColor).reduce((slotObj, color, index) => {
    slotObj[PieceColor[color]] = {
      startSlot: index === 0 ? 0 : index * (length - 1),
      endSlot: (index * (length - 1) === 0 ? (length - 1) * numPlayers : (index * (length - 1)) % ((length - 1) * numPlayers)) - 2,
      jumpSlot: ((index + 1) * (length - 1)) % ((length - 1) * numPlayers) + 4
    }
    return slotObj
  }, {});

  function parseSlot(codeString) {
    const code = codeString.split('-')
    const fraction = code.length > 0 ? parseFloat(code[1]) * 0.01 : 0
    return {
      type: parseSlotType(code[0]),
      rotate: (fraction * 360).toString() + 'deg',
      color: parseSlotColor(code.length > 0 ? code[2] : ''),
      slotNum: code.length > 3 ? (code[0] !== 's' ? code[3] * 1 : code[2] + '-' + code[3]) : null
    }
  }
  function parseSlotType(code) {
    switch (code) {
      case 't': return 'triangle'
      case 'r': return 'rectangle'
      case 's': return 'square-finish'
      case 'p': return 'rectangle'
      case 'j': return 'jump'
      default: return 'empty'
    }
  }
  function parseSlotColor(code) {
    return code === '' ? '' : ColorsDict[code]
  }

  //TODO: 3 sixes send piece home
  //FIX: optimisation at the end, around round 21+, server will freeze
  const currentColor = currentTurnInd === -1 ? null : Object.values(PieceColor)[currentTurnInd]
  const handlePieceSelect = (id, color, position) => {
    if (currentColor === color && hasPieceSelected === true) {

      if (validPieceClick(position)) {
        setHasPieceSelected(false)
        calculatePiecePositions(currentRoll, id, color, position)
      }
    }
  }
  const validPieceClick = (piecePosition) => {
    return (currentRoll % 2 === 0 && piecePosition === null) || piecePosition !== null
  }
  const calculatePiecePositions = (roll, pId, currentColor, currPosition) => {
    const newPositions = JSON.parse(JSON.stringify(piecePositions)) // create deep copy
    let pieceId = pId.split('-')[1] - 1
    let currSlot = piecePositions[currentColor][pieceId]

    if (goHome === true) {
      newPositions[currentColor][pieceId] = null
      setGoHome(false)
      setPiecePositions(newPositions)
      return
    }

    // Other pieces of this color stacked on the same spot as the one being moved —
    // they move (and are taken) together with it from here on.
    const stackMateIds = getStackMates(currentColor, currPosition, pieceId)

    // piecePosition on finsih land will have prefix color-
    if (currSlot !== null && currSlot.toString().includes('-')) {
      const finalValue = calculateFinish(currSlot.split('-')[1] * 1, currentColor, true)
      newPositions[currentColor][pieceId] = finalValue
      stackMateIds.forEach(id => { newPositions[currentColor][id] = finalValue })
    } else {
      currSlot += roll
      const colorShift = (currPosition === 0) * terminalSlots[currentColor].startSlot
      const maxSlot = (length - 1) * numPlayers
      // new position from roll
      const newPosition =
        currPosition === null ?
          (roll % 2 === 0 ? 0 : null)
          : Math.min((currSlot % (maxSlot) === 0 ? maxSlot : currSlot % maxSlot), currSlot) + colorShift
      // jump or finish lane
      const slotColor = slotColorMap[newPosition]
      const piecesToTake = canTakePieces(newPosition)
      let finalValue
      if (piecesToTake.length > 0 && currPosition !== terminalSlots[currentColor].endSlot && !inFinishLane(pId, currPosition, newPosition)) {
        finalValue = newPosition
        piecesToTake.forEach(({ color, pieceIndex }) => { newPositions[color][pieceIndex] = null })
      } else {
        finalValue =
          inFinishLane(pId, currPosition, newPosition)
            ? calculateFinish(newPosition, currentColor, false) // gets next position within finish lane
            : (slotColor === currentColor ? calculateJump(newPosition, currentColor) : newPosition) // gets next position, if possible also jumps
        if (!finalValue.toString().includes('-') && finalValue !== null) {
          const piecesToTakeAfterJump = canTakePieces(finalValue)
          piecesToTakeAfterJump.forEach(({ color, pieceIndex }) => { newPositions[color][pieceIndex] = null })
        }
      }
      newPositions[currentColor][pieceId] = finalValue
      stackMateIds.forEach(id => { newPositions[currentColor][id] = finalValue })
    }
    setPiecePositions(newPositions)
    setLastMovedPiece({ color: currentColor, pieceId })

    const wonColor = Object.keys(newPositions).find(
      color => newPositions[color].every(p => p !== null && p.toString() === 'won')
    )
    if (wonColor) {
      setWinner(wonColor)
    }
  }

  const inFinishLane = (pId, currPosition, newPosition) => {
    return currPosition === terminalSlots[currentColor].endSlot ||
      (currPosition !== 0 && currPosition < terminalSlots[currentColor].endSlot && newPosition >= terminalSlots[currentColor].endSlot) // coming move goes to finish lane
  }
  const findNextSameColorSlot = (fromSlot, pieceColor) => {
    let slotId = fromSlot
    for (let i = 0; i < mainPathLength; i++) {
      slotId = (slotId % mainPathLength) + 1 // wraps 48 -> 1
      if (slotColorMap[slotId] === pieceColor) return slotId
    }
    return null
  }

  const calculateJump = (piecePosition, pieceColor) => {
    const nextSlotId = findNextSameColorSlot(piecePosition, pieceColor)
    if (nextSlotId === null) {
      // Defensive fallback: no matching color found on the whole path (shouldn't happen
      // given the board layout), so don't move the piece anywhere unexpected.
      return piecePosition
    }
    let result = nextSlotId
    // if next jump lands on, or departs from, this color's special jump slot, jump across the board
    if (nextSlotId === terminalSlots[pieceColor].jumpSlot || piecePosition === terminalSlots[pieceColor].jumpSlot) {
      result += CROSS_BOARD_OFFSET
      result = ((result - 1) % mainPathLength) + 1
      // after crossing, if the landing spot is itself same-colored, chain one more jump forward
      if (slotColorMap[result] === pieceColor) {
        const chained = findNextSameColorSlot(result, pieceColor)
        if (chained !== null) result = chained
      }
    }
    return result
  }

  const calculateFinish = (currentPositionOrSteps, pieceColor, alreadyInLane) => {
    // Unified so this ALWAYS returns either 'won' or a lane-relative "color-N" string —
    // never a raw absolute board number. Previously, landing exactly on the gate square
    // (endSlot) on first entry returned the raw endSlot number instead of a lane string,
    // which meant the piece silently fell back to ordinary shared-loop movement on its
    // next turn instead of continuing up its own private lane — the reported bug.
    const steps = alreadyInLane
      ? currentPositionOrSteps + currentRoll
      : currentPositionOrSteps - terminalSlots[pieceColor].endSlot

    if (steps === FINISH_LANE_LENGTH) {
      return 'won'
    }
    // Overshoot bounces back from the center — only possible once already in the lane;
    // a fresh single-die entry can never exceed FINISH_LANE_LENGTH in one move.
    const finalSteps = steps > FINISH_LANE_LENGTH ? FINISH_LANE_LENGTH - (steps - FINISH_LANE_LENGTH) : steps
    return convertColorCode(pieceColor) + '-' + finalSteps.toString()
  }
  const convertColorCode = (color) => {
    return Object.keys(ColorsDict).find(c => ColorsDict[c] === color)
  }

  const canTakePieces = (targetPosition) => {
    // Returns every opposing piece sitting on targetPosition (could be more than
    // one if the opponent has stacked their own-color pieces together there).
    const taken = []
    for (const [color, positions] of Object.entries(piecePositions)) {
      if (color === currentColor) continue
      positions.forEach((pos, i) => {
        if (pos === targetPosition && pos !== null && pos !== 0) {
          taken.push({ color, pieceIndex: i })
        }
      })
    }
    return taken
  }

  const getStackMates = (color, position, excludePieceId) => {
    // Other pieces of the same color already sitting on `position` — these move,
    // and are taken, together with the piece being moved.
    if (position === null) return []
    return piecePositions[color]
      .map((p, idx) => ({ p, idx }))
      .filter(({ p, idx }) => idx !== excludePieceId && p !== null && p.toString() === position.toString())
      .map(({ idx }) => idx)
  }

  const handleRoll = () => {
    const nextTurnInd = Math.max(0, (currentTurnInd + 1 - (sixRoll > 0)) % numPlayers);
    setCurrentTurnInd(nextTurnInd)
    const randomRoll = Math.floor(Math.random() * 6) + 1;
    const newRoundNum = round + 1;
    setHasPieceSelected(true)
    if (randomRoll === 6) {
      if (sixRoll < 2) {
        setSixRoll(sixRoll => sixRoll + 1);
      } else {
        setSixRoll(0);
        // Send home the piece that was moved earlier in this same six-streak.
        // Guard on color match in case the player rolled again without moving
        // anything yet (lastMovedPiece could be stale from a prior turn).
        if (lastMovedPiece && lastMovedPiece.color === currentColor) {
          setPiecePositions(prev => {
            const updated = JSON.parse(JSON.stringify(prev))
            updated[lastMovedPiece.color][lastMovedPiece.pieceId] = null
            return updated
          })
          setLastMovedPiece(null)
          setHasPieceSelected(false) // this roll is consumed sending the piece home, not for moving
        } else {
          // Fallback: nothing moved yet this streak, so apply on whichever piece is clicked next
          setGoHome(true)
        }
      }
    } else {
      setSixRoll(0);
    }

    const displayColor = Object.values(PieceColor)[(sixRoll > 0) ? currentTurnInd : nextTurnInd]
    const newTurnDisplay = getDisplay(newRoundNum, displayColor, randomRoll);
    const newGameLogEntry = {
      currentRound: newRoundNum,
      currentRoll: randomRoll,
      roundDisplay: newTurnDisplay,
      piecePositions: piecePositions,
      timestamp: new Date().toLocaleTimeString(),
      event: ''
    }

    setGameLog([...gameLog, newGameLogEntry])
    setRoundDisplay(newTurnDisplay);
    setCurrentRoll(randomRoll);
    setRound(newRoundNum)
  }


  const getDisplay = (round, color, roll) => {
    return `Round ${round} : ${color} rolled a ${roll}`
  }

  const restoreFromLog = (logEntry) => {
    // NOTE: logEntry.currentTurnInd is never actually set when log entries are created
    // (only currentRound is) — this will restore turn index as undefined. Flagging
    // rather than fixing since the log/restore feature itself wasn't in your spec.
    setCurrentTurnInd(logEntry.currentTurnInd);
    setCurrentRoll(logEntry.currentRoll);
    setRoundDisplay(logEntry.roundDisplay);
    setPiecePositions(logEntry.piecePositions)
  };

  const toggleLogPanel = () => {
    setShowGameLog(!showGameLog);
  };

  function SlotOutput(type) {
    return "slot-" + type + "-container"

  }

  const renderJumpSlot = (color, rotate) => {
    let jumpClass;
    switch (color) {
      case PieceColor.BLUE:
        jumpClass = 'jump-up'
        break;
      case PieceColor.GREEN:
        jumpClass = 'jump-right'
        break;
      case PieceColor.RED:
        jumpClass = 'jump-down'
        break;
      case PieceColor.ORANGE:
        jumpClass = 'jump-left'
        break;
      default:
        return;

    }
    return (<div className="slot-empty-container"><div className={jumpClass} style={{ backgroundColor: color, '--arrow-color': color, }}></div></div>)
  }

  const renderPiece = (pieceId, color, position) => {
    return (<div id={pieceId} key={pieceId} className="piece-hop" onClick={() => handlePieceSelect(pieceId, color, position)} >
      <svg xmlns="https://www.w3.org/2000/svg" height='16' width='16' viewBox="0 0 48 56" >
        <path fill={color} d="M 49.5,21.5 C 49.5,23.5 49.5,25.5 49.5,27.5C 48.7109,27.7828 48.0442,28.2828 47.5,29C 41.5,29.3333 35.5,29.6667 29.5,30C 24.9271,35.15 20.5938,40.4833 16.5,46C 14.5273,46.4955 12.5273,46.6621 10.5,46.5C 11.8622,40.7669 13.5289,35.1002 15.5,29.5C 12.4281,29.1826 9.42814,29.5159 6.5,30.5C 5.52679,34.1477 3.19345,35.8143 -0.5,35.5C -0.5,33.1667 -0.5,30.8333 -0.5,28.5C 0.833333,25.8333 0.833333,23.1667 -0.5,20.5C -0.5,18.1667 -0.5,15.8333 -0.5,13.5C 3.19345,13.1857 5.52679,14.8523 6.5,18.5C 9.42814,19.4841 12.4281,19.8174 15.5,19.5C 13.5289,13.8998 11.8622,8.23313 10.5,2.5C 12.5273,2.33788 14.5273,2.50454 16.5,3C 20.5938,8.51671 24.9271,13.85 29.5,19C 35.5,19.3333 41.5,19.6667 47.5,20C 48.0442,20.7172 48.7109,21.2172 49.5,21.5 Z" />
      </svg>
    </div>)
  }

  const renderGameStat = () => {
    return (<><div className="player-grid">{Object.entries(piecePositions).map(([color, positions], _
    ) => (
      <div className="player-card">
        <Piece className="piece" pieceColor={color} id={color + '-stat'} onClickPiece={null} />
        <div>
          {'Won: ' + positions.filter(p => p?.toString().includes('won')).length}
        </div>
        <div>
          {'Home: ' + positions.filter(p => p === null).length}
        </div>
      </div>
    ))}</div></>)
  }

  const renderGameLog = () => {
    return (<><button className="toggle-button"
      onClick={toggleLogPanel}
    >
      {showGameLog ? "Hide Log" : "Show Log"}
    </button>
      {showGameLog && (<div className="log-panel">
        <div className="log-header">({gameLog.length} entries)</div>
        <div className="log-content">
          {gameLog.length === 0 ? (
            <div className="empty-log">No history yet</div>
          ) : (
            <ul className="log-list">
              {gameLog.map((entry, index) => (
                <li
                  key={index}
                  onClick={() => restoreFromLog(entry)}
                  className="log-item"
                >
                  <span>{entry.roundDisplay}</span>
                  <span className="timestamp">{entry.timestamp}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      )}</>)
  }

  const renderPath = () => {
    return <div className="path-grid">
      {startBoard.map((row, rowIndex) => (
        <div
          key={'row-' + rowIndex}
          id={'row-' + rowIndex}
          className="path-row"
        >
          {row.map((slot, slotIndex) => (
            <div className="slot-container" key={rowIndex * length + slotIndex}>
              {(() => {
                const parsed = parseSlot(slot)
                return parsed.type === 'jump' ? renderJumpSlot(parsed.color, parsed.rotate) : <div className={SlotOutput(parsed.type)}
                  id={parsed.slotNum}
                  style={{ rotate: parsed.rotate, backgroundColor: parsed.color }}
                >
                  <div className="slot-circle" >
                    {Object.keys(animatedPositions).map(c => (animatedPositions[c].map((animPos, pieceInd) => {
                      if (String(animPos) === String(parsed.slotNum) && animPos !== null) {
                        const pieceId = `${c}-${pieceInd + 1}`
                        const realPos = piecePositions[c][pieceInd]
                        return renderPiece(pieceId, c, realPos)
                      } else {
                        return null
                      }
                    })))}
                  </div>
                </div>
              })()}
            </div>
          )
          )}
        </div>
      ))}
    </div >
  }
  const borderColor = '#007bff'
  const borderWidth = 2
  const offset = 10
  const arrowPosition = 'top'
  const arrowSize = 1
  const getBorderStyle = () => ({
    position: 'absolute',
    top: -offset,
    left: -offset,
    right: -offset,
    bottom: -offset,
    border: `${borderWidth}px solid ${borderColor}`,
    borderRadius: '12px',
    opacity: isHovered ? 1 : 0,
    transform: isHovered ? 'scale(1)' : 'scale(0.95)',
    transition: 'all 0.3s ease',
    pointerEvents: 'none',
    zIndex: -1,
  });
  const getArrowStyle = () => {
    const baseStyle = {
      position: 'absolute',
      width: 0,
      height: 0,
      opacity: isHovered ? 1 : 0,
      transition: 'all 0.3s ease',
      pointerEvents: 'none',
    };

    const arrowOffset = isHovered ? 5 : 0;

    switch (arrowPosition) {
      case 'top':
        return {
          ...baseStyle,
          top: isHovered ? -(offset + arrowSize + arrowOffset) : -(offset + arrowSize),
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid transparent`,
          borderTop: `${arrowSize + 5}px solid ${borderColor}`,
        };
      case 'bottom':
        return {
          ...baseStyle,
          bottom: isHovered ? -(offset + arrowSize + arrowOffset) : -(offset + arrowSize),
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize + 5}px solid ${borderColor}`,
        };
      case 'left':
        return {
          ...baseStyle,
          left: isHovered ? -(offset + arrowSize + arrowOffset) : -(offset + arrowSize),
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize}px solid transparent`,
          borderLeft: `${arrowSize + 5}px solid ${borderColor}`,
        };
      case 'right':
        return {
          ...baseStyle,
          right: isHovered ? -(offset + arrowSize + arrowOffset) : -(offset + arrowSize),
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize + 5}px solid ${borderColor}`,
        };
      default:
        return baseStyle;
    }



  };
  const elementRef = useRef(null);
  const renderStartingStation = (color) => {
    return (
      <div
        ref={elementRef}
        style={{
          position: 'relative',
          display: 'inline-block',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
          boxShadow: isHovered ? `0 10px 25px ${color}33` : 'none',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={getBorderStyle()} />


        <div style={getArrowStyle()} />
        <StartingStation bgColor={color} onPieceSelect={handlePieceSelect} positions={piecePositions[color]} />
      </div>
    )
  }

  const handleStartGame = () => {
    setTimeout(() => setGameStarted(true), 300)

  };

  const resetGame = () => {
    setPiecePositions(initPositions)
    setAnimatedPositions(initPositions)
    setRound(0)
    setCurrentTurnInd(-1)
    setCurrentRoll(0)
    setGameLog([])
    setRoundDisplay('Click to Start the Game')
    setShowGameLog(false)
    setSixRoll(0)
    setHasPieceSelected(false)
    setGoHome(false)
    setLastMovedPiece(null)
    setWinner(null)
  };
  return (
    <div className="container">
      {!gameStarted && <PlayersConfig toStart={handleStartGame}></PlayersConfig>}
      {gameStarted && (<>
        <div className="board">
          <div className="adjacent-stations">
            {renderStartingStation(PieceColor.RED)}
            {renderStartingStation(PieceColor.ORANGE)}
            {/* <StartingStation bgColor={PieceColor.RED} onPieceSelect={handlePieceSelect} positions={piecePositions[PieceColor.RED]} />
          <StartingStation bgColor={PieceColor.ORANGE} onPieceSelect={handlePieceSelect} positions={piecePositions[PieceColor.ORANGE]} /> */}
          </div>
          <div className="path-container">
            {renderPath()}
          </div>
          <div className="adjacent-stations">
            {/* <StartingStation bgColor={PieceColor.GREEN} onPieceSelect={handlePieceSelect} positions={piecePositions[PieceColor.GREEN]} />
          <StartingStation bgColor={PieceColor.BLUE} onPieceSelect={handlePieceSelect} positions={piecePositions[PieceColor.BLUE]} /> */}
            {renderStartingStation(PieceColor.GREEN)}
            {renderStartingStation(PieceColor.BLUE)}
          </div>
        </div>
        <div className="game-controls">
          <div>
            <button className="roll-button" onClick={handleRoll} disabled={!!winner}>Roll the Dice</button>
            {winner && <button className="roll-button" onClick={resetGame}>Play Again</button>}
          </div>
          <div className="display-text">
            {winner ? `🎉 ${winner.toUpperCase()} WINS! 🎉` : roundDisplay}
          </div>
          <div className="display-text" style={{ fontSize: '0.75em', opacity: 0.7 }}>
            {isConnected ? '🟢 Synced with other players' : `⚪ Offline (multiplayer: ${connectionState})`}
          </div>
          <>{renderGameStat()}</>
          <>{renderGameLog()}</>
        </div></>)}
    </div>
  );
};

export default Board;