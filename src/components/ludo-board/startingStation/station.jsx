import Piece from "../../piece/piece";
import "./station.css";

const Station = ({ pieceColor }) => {
  return <div className="startingSpot">
    <Piece pieceColor={pieceColor} />
  </div>;
};

export default Station;
