import StartingStation from "./startingStation/startingStation";
import "./board.css";
import Path from "./path/path";

const Board = () => {
  return (
    <div className="board">
      <div className="adjacent-stations">
        <StartingStation bgColor={"red"} />
        <StartingStation bgColor={"blue"} />
      </div>
      <div className="path-container">
        <Path length={13} />
      </div>

      <div className="adjacent-stations">
        <StartingStation bgColor={"green"} />
        <StartingStation bgColor={"yellow"} />
      </div>
    </div>
  );
};

export default Board;
