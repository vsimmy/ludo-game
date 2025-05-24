import "./startingStation.css";
import Piece from "../../piece/piece";

const StartingStation = ({ bgColor, onPieceSelect, positions }) => {
  function styleStartingPosition(bgColor) {
    return bgColor + '-starting'
  }
  return (
    <div className="starting-station-container" key={styleStartingPosition(bgColor)} id={styleStartingPosition(bgColor)}>
      <div className="starting-slot" key={`${bgColor}-starting-slot`} id={`${bgColor}-starting-slot`}>
        {positions.map((p, i) => (<>{p === 0 && <Piece id={bgColor + '-' + (i + 1)} className="piece" pieceColor={bgColor} onClickPiece={onPieceSelect} position={p} />}</>))}
        <div style={{ color: bgColor }}>start</div>
      </div>

      <div className="station" style={{ backgroundColor: bgColor }} key={`${bgColor}-station`} id={`${bgColor}-station`} >
        {positions.map((p, i) => (
          <div className="start-spot" key={`${bgColor}-spot-${i}`} id={`${bgColor}-spot-${i}`}>
            {p === null && <Piece className="piece" pieceColor={bgColor} id={bgColor + '-' + (i + 1)} onClickPiece={onPieceSelect} position={null} />}
          </div>
        ))}
      </div>
    </div>

  );
};

export default StartingStation;
