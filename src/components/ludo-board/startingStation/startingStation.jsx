import Station from "./station";
import "./startingStation.css";

const StartingStation = ({ bgColor }) => {
  return (
    <div className="station" style={{ backgroundColor: bgColor }}>
      <Station />
      <Station />
      <Station />
      <Station />
    </div>
  );
};

export default StartingStation;
