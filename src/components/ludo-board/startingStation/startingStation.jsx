import "./startingStation.css";
import { PieceColor } from "../../ludo.type.ts";
import Piece from "../../piece/piece";

const StartingStation = ({ bgColor, onPieceSelect, positions }) => {
  function styleStartingPosition(bgColor) {
    switch (bgColor) {
      case PieceColor.RED: return 'red-starting'
      case PieceColor.BLUE: return 'blue-starting'
      case PieceColor.GREEN: return 'green-starting'
      case PieceColor.YELLOW: return 'yellow-starting'
      default: return {}
    }
  }
  return (//TODO: move starting platform to path compoonent, null is at station and index 0 for starting platform
    <div className="starting-station-container" key={styleStartingPosition(bgColor)} id={styleStartingPosition(bgColor)}>
      <div className="starting-slot">
        {/* {/* <span>{positions.length > 1 ? positions.length + 'x' : ''}</span> */}
        {positions.map((p, i) => (<>{p === 0 && <Piece id={bgColor + '-' + (i + 1)} className="piece" pieceColor={bgColor} onClickPiece={onPieceSelect} position={p} />}</>))}
        <div style={{ color: bgColor }}>start</div>
      </div>

      <div className="station" style={{ backgroundColor: bgColor }} >
        {positions.map((p, i) => (
          <div className="start-spot">
            {p === null && <Piece className="piece" pieceColor={bgColor} id={bgColor + '-' + (i + 1)} onClickPiece={onPieceSelect} position={null} />}
          </div>
        ))}
      </div>
    </div>

  );
};

export default StartingStation;
