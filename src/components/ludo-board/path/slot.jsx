import "./slot.css";

const Slot = ({ key, type }) => {
  function SlotOutput(type) {
    if (type === "square") {
      return "slot-rectangle";
    }
    if (type === "square-finish") {
      return "slot-finish-container";
    }
    if (type === "triangle") {
      return "slot-triangle";
    } else {
      return "empty";
    }
  }
  return (
    <div className="slot-container">
      <div
        className={
          type === "empty"
            ? "empty-slot-container"
            : type === "square-finish"
            ? "slot-vertical-container"
            : "slot-horizontal-container"
        }
        key={key}
      >
        <div className={SlotOutput(type)}></div>
      </div>
    </div>
  );
};

export default Slot;
