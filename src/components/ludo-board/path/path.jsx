import { useState, useEffect } from "react";
import "./path.css";
import Slot from "./slot";

const Path = ({ length }) => {
  // tODO: 4th type for square
  const firstRow = [0, 0, 0, 2, 1, 1, 3, 1, 1, 2, 0, 0, 0];
  const secondRow = [0, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 0];
  const thirdRow = secondRow;
  const fourthRow = [2, 1, 1, 2, 0, 0, 5, 0, 0, 2, 1, 1, 2];
  const fifthRow = [3, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 3];
  const endRow = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
  const startBoard = [
    firstRow,
    secondRow,
    thirdRow,
    fourthRow,
    fifthRow,
    endRow,
    fifthRow,
    fourthRow,
    thirdRow,
    secondRow,
    firstRow,
  ];
  const [slots, setSlots] = useState(startBoard);

  return (
    <div style={{ display: "flex", flexDirection: "column", margin: "0" }}>
      {startBoard.map((row, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: "flex",
            justifyContent: "space-between",
            margin: "0",
          }}
        >
          {row.map((slot, slotIndex) => {
            if (slot === 1) {
              return <Slot key={`${rowIndex}-${slotIndex}`} type="square" />;
            } else if (slot === 2) {
              return <Slot key={`${rowIndex}-${slotIndex}`} type="triangle" />;
            } else if (slot === 3) {
              return (
                <Slot key={`${rowIndex}-${slotIndex}`} type="square-finish" />
              );
            } else {
              return <Slot key={`${rowIndex}-${slotIndex}`} type="empty" />;
            }
          })}
        </div>
      ))}
    </div>
  );
};

export default Path;
