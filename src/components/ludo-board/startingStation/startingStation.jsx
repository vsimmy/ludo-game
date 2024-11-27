import Station from "./station";
import "./startingStation.css";
import { PieceColor } from "../../ludo.type.ts";

const StartingStation = ({ bgColor }) => {
  function styleStartingPosition(bgColor) {
    switch (bgColor) {
      case PieceColor.RED: return 'red-starting'
      case PieceColor.BLUE: return 'blue-starting'
      case PieceColor.GREEN: return 'green-starting'
      case PieceColor.YELLOW: return 'yellow-starting'
      default: return {}
    }
  }
  return (
    <div className="starting-station-container" id={styleStartingPosition(bgColor)}>
      <div style={{ color: bgColor }}>start</div>
      <div className="station" style={{ backgroundColor: bgColor }}>
        <Station pieceColor={bgColor} />
        <Station pieceColor={bgColor} />
        <Station pieceColor={bgColor} />
        <Station pieceColor={bgColor} />
      </div>
    </div>

  );
};

export default StartingStation;
