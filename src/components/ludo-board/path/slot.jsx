import "./slot.css";
import Piece from "../../piece/piece";
const Slot = ({ id, type, rotate, color, piece }) => {

  function SlotOutput(type) {
    return "slot-" + type + "-container"

  }

  return (
    <div className="slot-container" >
      <div className={SlotOutput(type)}
        id={id}
        style={{ rotate: rotate, backgroundColor: color }}
      >
        <div className="slot-circle">

          {piece && piece.position === id * 1 && <Piece className="piece" pieceColor={piece.color} id={piece.id} onClickPiece={piece.onPieceSelect} position={piece.position} />}
        </div>
      </div>
    </div>
  );
};

export default Slot;
