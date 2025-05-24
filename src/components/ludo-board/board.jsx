import StartingStation from "./startingStation/startingStation";
import "./board.css";
import { useCallback, useEffect, useState } from "react";
import { ColorsDict } from "../ludo.type.ts";
import { PieceColor } from "../ludo.type.ts";

const Board = () => {

  const numPlayers = 4
  const initPositions = Object.values(PieceColor).reduce((acc, key) => {
    acc[key] = [null, null, null, null]
    return acc
  }, {})
  const [round, setRound] = useState(0);
  const [currentTurnInd, setCurrentTurnInd] = useState(-1);
  const [currentRoll, setCurrentRoll] = useState(0);
  const [gameLog, setGameLog] = useState([]);
  const [roundDisplay, setRoundDisplay] = useState('Click to Start the Game');
  const [showGameLog, setShowGameLog] = useState(false);
  const [sixRoll, setSixRoll] = useState(0);
  const [piecePositions, setPiecePositions] = useState(initPositions);
  const [hasPieceSelected, setHasPieceSelected] = useState(false);
  const [goHome, setGoHome] = useState(false);
  const [pieceTaken, setPieceTaken] = useState({ color: null, pieceIndex: null })

  const length = 13
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

  const terminalSlots = Object.keys(PieceColor).reduce((slotObj, color, index) => {
    slotObj[PieceColor[color]] = {
      startSlot: index * (length - 1),
      endSlot: (index * (length - 1) === 0 ? (length - 1) * numPlayers : (index * (length - 1)) % ((length - 1) * numPlayers)) - 2,
      jumpSlot: ((index + 1) * (length - 1)) % ((length - 1) * numPlayers) + 4
    }
    return slotObj
  }, {});
  // const [pathCode, setPathCode] = useState(startBoard)
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
    if (code === '') { return '' }
    else {
      try { return ColorsDict[code] } catch (e) { throw new Error('no such code') }
    }
  }
  //TODO: when a piece reaches the finsihing lane, it should move to the same index of next array
  //TODO: when taking a piece on same color slot, it has a choice to jump or take
  //TODO: 3 sixes send piece home
  //FIX: optimisation at the end, around round 21+, server will freeze
  const currentColor = currentTurnInd === -1 ? null : Object.values(PieceColor)[currentTurnInd]
  const handlePieceSelect = (id, color, position) => {
    console.log("Piece selected:", { id, color, position, currentColor, currentRoll, hasPieceSelected });

    // setTimeout(() => this.setState({ hasPieceSelected: false }), 5000);//FIX add timeout after dice roll
    if (currentColor === color && hasPieceSelected === true) {

      //TODO: misclick an immovable piece or if piece has finished
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
    console.log(currSlot)

    if (goHome === true) {
      // findEmpty and go home
      console.log(goHome)
      newPositions[currentColor][pieceId] = null
      setGoHome(false);
    }
    // piecePosition on finsih land will have prefix color-
    if (currSlot !== null && currSlot.toString().includes('-')) {
      newPositions[currentColor][pieceId] = convertColorCode(currentColor) + '-' + calculateFinish(currSlot.split('-')[1] * 1, currentColor, pId, true)
    } else {
      currSlot += roll
      const colorShift = (currPosition === 0) * terminalSlots[currentColor].startSlot
      const maxSlot = (length - 1) * numPlayers
      // new position from roll
      const newPosition =
        currPosition === null ?
          (roll % 2 === 0 ? 0 : null)
          : Math.min((currSlot % (maxSlot) === 0 ? maxSlot : currSlot % maxSlot), currSlot) + colorShift
      console.log(currPosition, newPosition, terminalSlots[currentColor])
      //TODO: add piece take here, avoid DOM manipulation and use React State
      // jump or finish lane
      const slotColor = document.getElementById(newPosition)?.style.backgroundColor
      const pieceToTake = canTakePiece(newPosition)
      if (pieceToTake) {
        console.log('home')
        newPositions[currentColor][pieceId] = newPosition
        newPositions[pieceToTake.color][pieceToTake.pieceIndex] = null
      } else {
        newPositions[currentColor][pieceId] =
          document.getElementById(pId).parentElement.parentElement.className.includes('square-finish') || // on finish lane
            (currPosition !== 0 && currPosition <= terminalSlots[currentColor].endSlot && newPosition >= terminalSlots[currentColor].endSlot) // coming move goes to finish lane
            ? calculateFinish(newPosition, currentColor, pId, false) // gets next position within finish lane
            : (slotColor === currentColor ? calculateJump(newPosition, currentColor) : newPosition) // gets next position, if possible also jumps
      }
      console.log(newPosition, newPositions)
    }
    console.log(newPositions)
    setPiecePositions(newPositions)

  }

  const calculateJump = (piecePosition, pieceColor) => {
    console.log('jump')
    let nextSlotId = piecePosition + 1
    while (document.getElementById(nextSlotId)?.style.backgroundColor !== pieceColor) {
      nextSlotId++;
    }
    // if next jump is on jump slot or on jump slot
    if ((nextSlotId === terminalSlots[pieceColor].jumpSlot || piecePosition === terminalSlots[pieceColor].jumpSlot)
    ) {
      nextSlotId += 15
      nextSlotId %= (length - 1) * numPlayers
      // pieceTaken(nextSlotId)
    }
    return nextSlotId
  }

  const calculateFinish = (currPiecePosition, pieceColor, pId, inFinishLane) => {
    console.log(currPiecePosition)
    if (inFinishLane) {
      if ((currPiecePosition + currentRoll) === 5) {
        console.log('won') //FIX: does not win
        return null
      } else {
        const newPiecePosition = currPiecePosition + currentRoll
        return (newPiecePosition > 5 ? 5 - (newPiecePosition - 5) : newPiecePosition).toString()
      }
    } else {
      if (currPiecePosition * 1 - terminalSlots[pieceColor].endSlot === 5) {
        return null
      } else if (currPiecePosition * 1 === terminalSlots[pieceColor].endSlot) {
        return terminalSlots[pieceColor].endSlot
      } else {
        return convertColorCode(pieceColor) + '-' + (currPiecePosition - terminalSlots[pieceColor].endSlot).toString()
      }
    }
  }
  const convertColorCode = (color) => {
    return Object.keys(ColorsDict).find(c => ColorsDict[c] === color)
  }

  const canTakePiece = (targetPosition) => {
    // Check all pieces to see if any are at the target position
    for (const [color, positions] of Object.entries(piecePositions)) {
      for (let i = 0; i < positions.length; i++) {
        if (positions[i] === targetPosition && positions[i] !== null && positions[i] !== 0) {
          console.log(color, i)
          return { color: color, pieceIndex: i }
        }
      }
    }
    return null;
  }

  const handleRoll = () => {
    const nextTurnInd = Math.max(0, (currentTurnInd + 1 - (sixRoll > 0)) % numPlayers);
    setCurrentTurnInd(nextTurnInd)
    const randomRoll = Math.floor(Math.random() * 6) + 1;
    const newRoundNum = round + 1;
    setHasPieceSelected(true)
    if (randomRoll === 6) {
      if (sixRoll < 3) {
        setSixRoll(sixRoll => sixRoll + 1);
      } else {
        console.log('go home')
        setGoHome(true)
        setSixRoll(0);
      }
    } else {
      setSixRoll(0);
    }

    const displayColor = Object.values(PieceColor)[(sixRoll > 0) ? currentTurnInd : nextTurnInd]
    console.log(displayColor, currentTurnInd, nextTurnInd)
    const newTurnDisplay = getDisplay(newRoundNum, displayColor, randomRoll);
    const newGameLogEntry = {
      currentRound: newRoundNum,
      currentRoll: randomRoll,
      roundDisplay: newTurnDisplay,
      piecePositions: piecePositions,
      timestamp: new Date().toLocaleTimeString()
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
    setCurrentTurnInd(logEntry.currentTurnInd);
    setCurrentRoll(logEntry.currentRoll);
    setRoundDisplay(logEntry.roundDisplay);
    setPiecePositions(logEntry.piecePositions)
    console.log(currentTurnInd, currentRoll, roundDisplay, piecePositions)
  };

  const toggleLogPanel = () => {
    setShowGameLog(!showGameLog);
  };

  function SlotOutput(type) {
    return "slot-" + type + "-container"

  }

  const renderJumpSlot = (color, rotate) => {
    return (<div className="slot-empty-container"><div className={rotate === '180deg' ? "jump-vertical" : "jump-horizontal"} style={{ backgroundColor: color, '--arrow-color': color }}></div></div>)
  }

  const renderPiece = (pieceId, color, position) => {
    return (<div id={pieceId} key={pieceId} onClick={() => handlePieceSelect(pieceId, color, position)} >
      <svg xmlns="https://www.w3.org/2000/svg" height='16' width='16' viewBox="0 0 48 56" >
        <path fill={color} d="M 49.5,21.5 C 49.5,23.5 49.5,25.5 49.5,27.5C 48.7109,27.7828 48.0442,28.2828 47.5,29C 41.5,29.3333 35.5,29.6667 29.5,30C 24.9271,35.15 20.5938,40.4833 16.5,46C 14.5273,46.4955 12.5273,46.6621 10.5,46.5C 11.8622,40.7669 13.5289,35.1002 15.5,29.5C 12.4281,29.1826 9.42814,29.5159 6.5,30.5C 5.52679,34.1477 3.19345,35.8143 -0.5,35.5C -0.5,33.1667 -0.5,30.8333 -0.5,28.5C 0.833333,25.8333 0.833333,23.1667 -0.5,20.5C -0.5,18.1667 -0.5,15.8333 -0.5,13.5C 3.19345,13.1857 5.52679,14.8523 6.5,18.5C 9.42814,19.4841 12.4281,19.8174 15.5,19.5C 13.5289,13.8998 11.8622,8.23313 10.5,2.5C 12.5273,2.33788 14.5273,2.50454 16.5,3C 20.5938,8.51671 24.9271,13.85 29.5,19C 35.5,19.3333 41.5,19.6667 47.5,20C 48.0442,20.7172 48.7109,21.2172 49.5,21.5 Z" />
      </svg>
    </div>)
  }


  const renderPath = () => {
    return <div style={{ display: "flex", flexDirection: "column", margin: "0" }}>
      {startBoard.map((row, rowIndex) => (
        <div
          key={'row-' + rowIndex}
          id={'row-' + rowIndex}
          style={{
            display: "flex",
            justifyContent: "space-between",
            margin: "0",
          }}
        >
          {row.map((slot, slotIndex) => (
            <div className="slot-container" key={rowIndex * length + slotIndex}>
              {parseSlot(slot).type === 'jump' ? renderJumpSlot(parseSlot(slot).color, parseSlot(slot).rotate) : <div className={SlotOutput(parseSlot(slot).type)}
                id={parseSlot(slot).slotNum}
                style={{ rotate: parseSlot(slot).rotate, backgroundColor: parseSlot(slot).color }}
              >
                <div className="slot-circle" >
                  {Object.keys(piecePositions).map(c => (piecePositions[c].map((piecePos, pieceInd) => {
                    if (String(piecePos) === String(parseSlot(slot).slotNum) && piecePos !== null) {
                      const pieceId = `${c}-${pieceInd + 1}`
                      return renderPiece(pieceId, c, piecePos)
                    } else {
                      return null
                    }
                  })))}
                </div>
              </div>}


            </div>
          )
          )}
        </div>
      ))}
    </div >
  }



  return (
    <div className="container">
      <div className="board">
        <div className="adjacent-stations">
          <StartingStation bgColor={PieceColor.RED} onPieceSelect={handlePieceSelect} positions={piecePositions[PieceColor.RED]} />
          <StartingStation bgColor={PieceColor.ORANGE} onPieceSelect={handlePieceSelect} positions={piecePositions[PieceColor.ORANGE]} />
        </div>
        <div className="path-container">
          {renderPath()}
        </div>
        <div className="adjacent-stations">
          <StartingStation bgColor={PieceColor.GREEN} onPieceSelect={handlePieceSelect} positions={piecePositions[PieceColor.GREEN]} />
          <StartingStation bgColor={PieceColor.BLUE} onPieceSelect={handlePieceSelect} positions={piecePositions[PieceColor.BLUE]} />
        </div>
      </div>
      <div>
        <div>
          <button className="roll-button" onClick={handleRoll}>Roll the Dice</button>
        </div>
        <div className="display-text">
          {roundDisplay}
        </div>
        <button className="toggle-button"
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
        )}

      </div></div>



  );
};

export default Board;
