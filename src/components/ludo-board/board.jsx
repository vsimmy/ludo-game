import StartingStation from "./startingStation/startingStation";
import "./board.css";
import Path from "./path/path";
import { useState } from "react";
import Dice from "../dice/dice";
import { PieceColor } from "../ludo.type.ts";

const Board = () => {


  const [round, setRound] = useState(0);

  const [turn, setTurn] = useState('');
  const [sixRoll, setSixRoll] = useState(0);
  const [toHome, setToHome] = useState(false);
  const [currentRoll, setCurrentRoll] = useState(null);
  const handlePieceSelect = (id, color, position) => {
    console.log(id, color);
    console.log(turn);
    if (turn === color) {
      console.log('match')
      if (turn) {
        //TODO: need to get current roll to match with Dice component, setState is async so prop passed to board will be lagged by one
      }
      if (position === 0) {
        console.log('at home')
      }
    }
  }
  const handleDiceRoll = (rollValue) => {
    setCurrentRoll(rollValue);
    getTurn(rollValue);

    console.log(rollValue)
    console.log(turn)
  }
  const getTurn = (roll) => {
    const colors = Object.values(PieceColor);
    let count = colors.indexOf(turn);

    if (roll !== 6) {
      setTurn(colors[(count + 1) % 4]);
      setRound(round => round + 1);
      console.log('round', round)

    } else {
      if (sixRoll < 3) {
        setSixRoll(sixRoll => sixRoll + 1);
      } else {
        setSixRoll(0);
        setTurn(colors[(count + 1) % 4]);
        setToHome(true);
      }

    }
    //TODO: 1. fix key so each piece can dynamically see slots forward starting from 1.. 
    // TODO: 2. slot stores occupied piece identifier
    //TODO: 3. winning condition  - 
    //TODO: 4.jumps - same color and long jump slots (including if killing over finishing line)


  }

  return (
    <>
      <div className="board">
        <div className="adjacent-stations">
          <StartingStation bgColor={"red"} onPieceSelect={handlePieceSelect} />
          <StartingStation bgColor={"yellow"} onPieceSelect={handlePieceSelect} />
        </div>
        <div className="path-container">
          <Path length={13} />
        </div>
        <div className="adjacent-stations">
          <StartingStation bgColor={"green"} onPieceSelect={handlePieceSelect} />
          <StartingStation bgColor={"blue"} onPieceSelect={handlePieceSelect} />
        </div>
      </div>
      <div>
        <Dice onRoll={handleDiceRoll} />
        {turn && <span>Current Turn: {turn}</span>}
        <br />
        {round !== 0 && <span>Current Round: {round}</span>}
      </div></>



  );
};

export default Board;
