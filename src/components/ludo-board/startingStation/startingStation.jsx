import "./startingStation.css";
import { PieceColor } from "../../ludo.type.ts";
import Piece from "../../piece/piece";

const StartingStation = ({ bgColor, onPieceSelect }) => {
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
      <div className="starting-slot">
        {/* {atStart && <Piece className="piece" pieceColor={bgColor} id={bgColor + '-' + (i + 1)} onClickPiece={onPieceSelect} position={0} /> } */}
        <div style={{ color: bgColor }}>start</div>
      </div>

      <div className="station" style={{ backgroundColor: bgColor }}>
        {[0, 1, 2, 3].map((p, i) => (
          <div key={i} className="start-spot">
            <Piece className="piece" pieceColor={bgColor} id={bgColor + '-' + (i + 1)} onClickPiece={onPieceSelect} position={0} />
          </div>
        ))}


      </div>
    </div>

  );
};

export default StartingStation;
