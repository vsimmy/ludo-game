import StartingStation from "./startingStation/startingStation";
import "./board.css";
import Path from "./path/path";
import GameControl from "./gameControl";

const Board = () => {
  return (
    <>
      <div className="board">
        <div className="adjacent-stations">
          <StartingStation bgColor={"red"} />
          <StartingStation bgColor={"yellow"} />
        </div>
        <div className="path-container">
          <Path />
        </div>
        <div className="adjacent-stations">
          <StartingStation bgColor={"green"} />
          <StartingStation bgColor={"blue"} />
        </div>
      </div>
      <GameControl /></>



  );
};

export default Board;
