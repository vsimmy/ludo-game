import "./slot.css";

const Slot = ({ key, type, rotate, color, isOccupied }) => {

  function SlotOutput(type) {
    return "slot-" + type + "-container"

  }

  return (
    <div className="slot-container">
      <div className={SlotOutput(type)}
        key={key}
        style={{ rotate: rotate, backgroundColor: color }}
      >
        <div className="slot-circle">

        </div>
      </div>
    </div>
  );
};
//change traiangle to container level

export default Slot;
