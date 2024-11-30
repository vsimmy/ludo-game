import "./slot.css";

const Slot = ({ id, type, rotate, color, isOccupied }) => {

  function SlotOutput(type) {
    return "slot-" + type + "-container"

  }

  return (
    <div className="slot-container">
      <div className={SlotOutput(type)}
        id={id}
        style={{ rotate: rotate, backgroundColor: color }}
      >
        <div className="slot-circle">

        </div>
      </div>
    </div>
  );
};

export default Slot;
