import { useState } from "react";
import "./path.css";

import Slot from "./slot";


const Path = ({ length }) => {
  // type(j,e,r,t,s)-rotate(50/0,25,50,75)-color(g,r,y,b)-isOccupied(1,0)
  const firstRow = ['', '', '', 't-25-b', 'r-50-g', 'r-50-r', 's-0-y', 'r-50-b', 'r-50-g', 't-50-r', '', '', ''];
  const secondRow = ['', '', '', 'r-0-y', '', '', 's-0-y', '', '', 'r-0-y', '', '', ''];
  const thirdRow = ['', '', '', 'r-0-r', '', '', 's-0-y', '', '', 'r-0-b', '', '', ''];
  const fourthRow = ['t-25-g', 'r-50-r', 'r-50-y', 'j-0-bg', '', '', 's-0-y', '', '', 'j-0-gr', 'r-50-y', 'r-50-b', 't-50-g'];
  const fifthRow = ['r-0-b', '', '', '', '', '', 's-0-y', '', '', '', '', '', 'r-0-r'];
  const sixthRow = ['r-0-y', '', '', '', '', '', 's-0-y', '', '', '', '', '', 'r-0-y'];
  const seventhRow = ['r-0-r', 's-0-r', 's-0-r', 's-0-r', 's-0-r', 's-0-r', 's-0-r', 's-0-b', 's-0-b', 's-0-b', 's-0-b', 's-0-b', 's-0-b', 'r-0-b'];

  const eighthRow = ['r-0-g', '', '', '', '', '', 's-0-g', '', '', '', '', '', 'r-0-g'];
  const ninthRow = ['r-0-b', '', '', '', '', '', 's-0-g', '', '', '', '', '', 'r-0-r'];
  const tenthRow = ['t-0-y', 'r-50-r', 'r-50-g', 'j-0-by', '', '', 's-0-g', '', '', 'j-0-yr', 'r-50-g', 'r-50-b', 't-75-y'];
  const eleventhRow = ['', '', '', 'r-0-r', '', '', 's-0-g', '', '', 'r-0-b', '', '', ''];
  const twelvethRow = ['', '', '', 'r-0-g', '', '', 's-0-g', '', '', 'r-0-g', '', '', '']
  const thirteenthRow = ['', '', '', 't-0-b', 'r-50-y', 'r-50-r', 's-0-g', 'r-50-b', 'r-50-y', 't-75-r', '', '', ''];
  const startBoard = [
    firstRow,
    secondRow,
    thirdRow,
    fourthRow,
    fifthRow,
    sixthRow,
    seventhRow,
    eighthRow,
    ninthRow,
    tenthRow,
    eleventhRow,
    twelvethRow,
    thirteenthRow
  ];
  const [slots, setSlots] = useState(startBoard);
  function parseSlot(codeString) {
    const code = codeString.split('-')
    const fraction = code.length > 0 ? parseFloat(code[1]) * 0.01 : 0
    return {
      type: parseSlotType(code[0]),
      rotate: (fraction * 360).toString() + 'deg',
      color: parseSlotColor(code.length > 0 ? code[2] : ''),
      isOccupied: false
    }
  }
  function parseSlotType(code) {
    switch (code) {
      case 't': return 'triangle'
      case 'r': return 'rectangle'
      case 's': return 'square-finish'
      default: return 'empty'
    }
  }
  function parseSlotColor(code) {
    const colors = { 'b': 'blue', 'g': 'green', 'y': 'yellow', 'r': 'red', '': 'transparent' }
    if (code === '') { return '' }

    else {
      try { return colors[code] } catch (e) { throw new Error('no such code') }
    }
  }
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
            return <Slot
              key={`${rowIndex}-${slotIndex}`}
              type={parseSlot(slot).type}
              rotate={parseSlot(slot).rotate}
              color={parseSlot(slot).color}
              isOccupied={parseSlot(slot).isOccupied} />;
          }
          )}
        </div>
      ))}
    </div>
  );
};

export default Path;
