import StartingStation from "./startingStation/startingStation";
import "./board.css";
import { useState } from "react";
import { ColorsDict } from "../ludo.type.ts";
import { PieceColor } from "../ludo.type.ts";

const Board = () => {


  const initPositions = Object.values(PieceColor).reduce((acc, key) => {
    acc[key] = [null, null, null, null]
    return acc
  }, {}) //TODO: use this as init and use click evnt listener to set startin positions and also set path piece positions 
  const [round, setRound] = useState(0);
  const [currentTurnInd, setCurrentTurnInd] = useState(-1);
  const [currentRoll, setCurrentRoll] = useState(0);
  const [gameLog, setGameLog] = useState([]);
  const [roundDisplay, setRoundDisplay] = useState('Click to Start the Game');
  const [showGameLog, setShowGameLog] = useState(false);
  const [sixRoll, setSixRoll] = useState(0);
  const [piecePositions, setPiecePositions] = useState(initPositions);
  const [hasPieceSelected, setHasPieceSelected] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState(null)

  const length = 13



  const getPiece = (slotNum, onPieceSelect) => {

    return Object.keys(piecePositions).map(c => (piecePositions[c].map((p, i) => {
      return {
        color: c,
        id: c + '-' + i,
        isOccupied: slotNum === null || slotNum === undefined ? false : slotNum === p,
        onPieceSelect: onPieceSelect,
        position: p
      };
    }

    )))

  }



  const firstRow = ['', '', '', 't-25-b-33', 'r-50-g-34', 'r-50-r-35', 's-0-y-36', 'r-50-b-37', 'r-50-g-38', 't-50-r-39', '', '', ''];
  const secondRow = ['', '', '', 'r-0-y-32', '', '', 's-0-y', '', '', 'r-0-y-40', '', '', ''];
  const thirdRow = ['', '', '', 'r-0-r-31', '', '', 's-0-y', '', '', 'r-0-b-41', '', '', ''];
  const fourthRow = ['t-25-g-26', 'r-50-r-27', 'r-50-y-28', 'j-0-bg-29', '', '', 's-0-y', '', '', 'j-0-gr-42', 'r-50-y-44', 'r-50-b-45', 't-50-g-46'];
  const fifthRow = ['r-0-b-25', '', '', '', '', '', 's-0-y', '', '', '', '', '', 'r-0-r-47'];
  const sixthRow = ['r-0-y-24', '', '', '', '', '', 's-0-y', '', '', '', '', '', 'r-0-y-48'];
  const seventhRow = ['r-0-r-23', 's-0-r', 's-0-r', 's-0-r', 's-0-r', 's-0-r', 's-0-r', 's-0-b', 's-0-b', 's-0-b', 's-0-b', 's-0-b', 's-0-b', 'r-0-b-49'];

  const eighthRow = ['r-0-g-22', '', '', '', '', '', 's-0-g', '', '', '', '', '', 'r-0-g'];
  const ninthRow = ['r-0-b-21', '', '', '', '', '', 's-0-g', '', '', '', '', '', 'r-0-r'];
  const tenthRow = ['t-0-y-20', 'r-50-r-19', 'r-50-g-18', 'j-0-by-16', '', '', 's-0-g', '', '', 'j-0-yr-4', 'r-50-g-3', 'r-50-b-2', 't-75-y-1'];
  const eleventhRow = ['', '', '', 'r-0-r-15', '', '', 's-0-g', '', '', 'r-0-b-5', '', '', ''];
  const twelvethRow = ['', '', '', 'r-0-g-14', '', '', 's-0-g', '', '', 'r-0-g-6', '', '', '']
  const thirteenthRow = ['', '', '', 't-0-b-13', 'r-50-y-12', 'r-50-r-11', 's-0-g-10', 'r-50-b-9', 'r-50-y-8', 't-75-r-7', '', '', ''];
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
  const startSlots = Array.from({ length: 4 }, (_, index) => index * length - 1)
  const [pathCode, setPathCode] = useState(startBoard) //TODO: each turn pathcode is rotated and finish path is reset
  function parseSlot(codeString) {
    const code = codeString.split('-')
    const fraction = code.length > 0 ? parseFloat(code[1]) * 0.01 : 0
    return {
      type: parseSlotType(code[0]),
      rotate: (fraction * 360).toString() + 'deg',
      color: parseSlotColor(code.length > 0 ? code[2] : ''),
      slotNum: code.length > 3 ? code[3] * 1 : null
    }
  }
  function parseSlotType(code) {
    switch (code) {
      case 't': return 'triangle'
      case 'r': return 'rectangle'
      case 's': return 'square-finish'
      default: return 'empty'
    }
  }
  function parseSlotColor(code) {

    if (code === '') { return '' }

    else {
      try { return ColorsDict[code] } catch (e) { throw new Error('no such code') }
    }
  }
  //TODO: 1. fix key so each piece can dynamically see slots forward starting from 1.. -need to merge startboard from path to piecePositions and rotate matrix
  // TODO: 2. slot stores occupied piece identifier
  //TODO: 3. winning condition  - 
  //TODO: 4.jumps - same color and long jump slots (including if killing over finishing line)
  const currentColor = currentTurnInd === -1 ? null : Object.values(PieceColor)[currentTurnInd]
  const handlePieceSelect = (id, color, position) => {
    console.log("Piece selected:", { id, color, position, currentColor, currentRoll });
    if (currentColor === color && hasPieceSelected === false) {
      setHasPieceSelected(true)

      const newPositions = JSON.parse(JSON.stringify(piecePositions))
      let pieceId = id.split('-')[1] - 1
      newPositions[currentColor][pieceId] =
        position === null ?
          (currentRoll % 2 === 0 ? 0 : null)
          : piecePositions[currentColor][pieceId] + currentRoll + (position === 0) * startSlots[Object.values(PieceColor).indexOf(currentColor)]
      setPiecePositions(newPositions)
      console.log(newPositions)
    }
    setHasPieceSelected(false)

  }
  const handleRoll = () => {
    const nextTurnInd = currentTurnInd === -1 ? 0 : (currentTurnInd + 1) % 4;
    setCurrentTurnInd(nextTurnInd)
    const randomRoll = Math.floor(Math.random() * 6) + 1;
    const newRoundNum = round + 1;

    // when 6 it should delay turnInd

    if (randomRoll === 6) {
      if (sixRoll < 3) {
        setSixRoll(sixRoll => sixRoll + 1);
        setCurrentTurnInd(currentTurnInd)
      } else {

        //setToHome(true);
        setSixRoll(0);
      }
    }
    if (randomRoll !== 6) {
      setSixRoll(0);

    }
    console.log(Object.values(PieceColor)[currentTurnInd], Object.values(PieceColor)[nextTurnInd])
    const displayColor = Object.values(PieceColor)[randomRoll === 6 ? currentTurnInd : nextTurnInd]
    const newTurnDisplay = getDisplay(newRoundNum, displayColor, randomRoll);
    const newGameLogEntry = {
      currentRound: newRoundNum,
      currentRoll: randomRoll,
      roundDisplay: newTurnDisplay,
      timestamp: new Date().toLocaleTimeString()
    }

    setGameLog([...gameLog, newGameLogEntry])



    setRoundDisplay(newTurnDisplay); setCurrentRoll(randomRoll);
    setRound(newRoundNum)
  }


  const getDisplay = (round, color, roll) => {
    return `Round ${round} : ${color} rolled a ${roll}`
  }

  const restoreFromLog = (logEntry) => {
    setCurrentTurnInd(logEntry.currentTurnInd);
    setCurrentRoll(logEntry.currentRoll);
    setRoundDisplay(logEntry.roundDisplay);
  };

  const toggleLogPanel = () => {
    setShowGameLog(!showGameLog);
  };

  function SlotOutput(type) {
    return "slot-" + type + "-container"

  }

  const renderPath = () => {
    pathCode.map((row, rowIndex) => (row.map((slot, slotIndex) => (Object.keys(piecePositions).map(c => (piecePositions[c].map((piecePos, pieceInd) => {
      if (String(piecePos) === String(parseSlot(slot).slotNum) && piecePos !== null) console.log(piecePos, parseSlot(slot).slotNum)
    })))))))

    return <div style={{ display: "flex", flexDirection: "column", margin: "0" }}>
      {pathCode.map((row, rowIndex) => (
        <div
          key={rowIndex}
          id={rowIndex}
          style={{
            display: "flex",
            justifyContent: "space-between",
            margin: "0",
          }}
        >
          {row.map((slot, slotIndex) => (
            <div className="slot-container" key={rowIndex * length + slotIndex}>
              <div className={SlotOutput(parseSlot(slot).type)}
                id={parseSlot(slot).slotNum}
                style={{ rotate: parseSlot(slot).rotate, backgroundColor: parseSlot(slot).color }}
              >
                <div className="slot-circle" >

                  {Object.keys(piecePositions).map(c => (piecePositions[c].map((piecePos, pieceInd) => {

                    if (String(piecePos) === String(parseSlot(slot).slotNum) && piecePos !== null) {
                      const pieceId = `${c}-${pieceInd + 1}`
                      return (<div id={pieceId} key={pieceId} onClick={() => handlePieceSelect(pieceId, c, piecePos)} >
                        <svg xmlns="https://www.w3.org/2000/svg" height='16' width='16' viewBox="0 0 48 56" >
                          <path fill={c} d="M 49.5,21.5 C 49.5,23.5 49.5,25.5 49.5,27.5C 48.7109,27.7828 48.0442,28.2828 47.5,29C 41.5,29.3333 35.5,29.6667 29.5,30C 24.9271,35.15 20.5938,40.4833 16.5,46C 14.5273,46.4955 12.5273,46.6621 10.5,46.5C 11.8622,40.7669 13.5289,35.1002 15.5,29.5C 12.4281,29.1826 9.42814,29.5159 6.5,30.5C 5.52679,34.1477 3.19345,35.8143 -0.5,35.5C -0.5,33.1667 -0.5,30.8333 -0.5,28.5C 0.833333,25.8333 0.833333,23.1667 -0.5,20.5C -0.5,18.1667 -0.5,15.8333 -0.5,13.5C 3.19345,13.1857 5.52679,14.8523 6.5,18.5C 9.42814,19.4841 12.4281,19.8174 15.5,19.5C 13.5289,13.8998 11.8622,8.23313 10.5,2.5C 12.5273,2.33788 14.5273,2.50454 16.5,3C 20.5938,8.51671 24.9271,13.85 29.5,19C 35.5,19.3333 41.5,19.6667 47.5,20C 48.0442,20.7172 48.7109,21.2172 49.5,21.5 Z" />
                        </svg>

                      </div>)
                    } else {
                      return null
                    }
                  })))}
                </div>
              </div>
            </div>
          )
          )}
        </div>
      ))}
    </div >
  }

  /// TODO: MASTER - select piece based on number rolled and it should move, abstract six roll logic and isMoveLegal and how the piece goes from home to station to path
  // , provide highlight of pieces per turn

  return (
    <div className="container">
      <div className="board">
        <div className="adjacent-stations">
          <StartingStation bgColor={"red"} onPieceSelect={handlePieceSelect} positions={piecePositions['red']} />
          <StartingStation bgColor={"yellow"} onPieceSelect={handlePieceSelect} positions={piecePositions['yellow']} />
        </div>
        <div className="path-container">
          {/* <Path length={13} onPieceSelect={handlePieceSelect} piecePositions={piecePositions} turn={currentColor} /> */}
          {renderPath()}
        </div>
        <div className="adjacent-stations">
          <StartingStation bgColor={"green"} onPieceSelect={handlePieceSelect} positions={piecePositions['green']} />
          <StartingStation bgColor={"blue"} onPieceSelect={handlePieceSelect} positions={piecePositions['blue']} />
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
