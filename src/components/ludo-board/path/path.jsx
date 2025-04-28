import { useState } from "react";
import "./path.css";

import Slot from "./slot";
import { ColorsDict } from "../../ludo.type.ts";


const Path = ({ length, piecePositions, onPieceSelect, turn }) => {

  // type(j,e,r,t,s)-rotate(50/0,25,50,75)-color(g,r,y,b)-isOccupied(1,0)
  const firstRow = ['', '', '', 't-25-b-33', 'r-50-g-34', 'r-50-r-35', 's-0-y-36', 'r-50-b-37', 'r-50-g-38', 't-50-r-39', '', '', ''];
  const secondRow = ['', '', '', 'r-0-y-32', '', '', 's-0-y', '', '', 'r-0-y-40', '', '', ''];
  const thirdRow = ['', '', '', 'r-0-r-31', '', '', 's-0-y', '', '', 'r-0-b-41', '', '', ''];
  const fourthRow = ['t-25-g-26', 'r-50-r-27', 'r-50-y-28', 'j-0-bg-29', '', '', 's-0-y', '', '', 'j-0-gr-42', 'r-50-y-44', 'r-50-b-45', 't-50-g-46'];
  const fifthRow = ['r-0-b-25', '', '', '', '', '', 's-0-y', '', '', '', '', '', 'r-0-r-47'];
  const sixthRow = ['r-0-y-24', '', '', '', '', '', 's-0-y', '', '', '', '', '', 'r-0-y-48'];
  const seventhRow = ['r-0-r-23', 's-0-r', 's-0-r', 's-0-r', 's-0-r', 's-0-r', 's-0-r', 's-0-b', 's-0-b', 's-0-b', 's-0-b', 's-0-b', 's-0-b', 'r-0-b-49'];

  const eighthRow = ['r-0-g-22', '', '', '', '', '', 's-0-g', '', '', '', '', '', 'r-0-g'];
  const ninthRow = ['r-0-b-21', '', '', '', '', '', 's-0-g', '', '', '', '', '', 'r-0-r'];
  const tenthRow = ['t-0-y-20', 'r-50-r-19', 'r-50-g-18', 'j-0-by-16', '', '', 's-0-g', '', '', 'j-0-yr-4', 'r-50-g-3', 'r-50-b-2', 't-75-y-1'];
  const eleventhRow = ['', '', '', 'r-0-r-15', '', '', 's-0-g', '', '', 'r-0-b-5', '', '', ''];
  const twelvethRow = ['', '', '', 'r-0-g-14', '', '', 's-0-g', '', '', 'r-0-g-6', '', '', '']
  const thirteenthRow = ['', '', '', 't-0-b-13', 'r-50-y-12', 'r-50-r-11', 's-0-g-10', 'r-50-b-9', 'r-50-y-8', 't-75-r-7', '', '', ''];
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
  const [pathCode, setPathCode] = useState(startBoard) //TODO: each turn pathcode is rotated and finish path is reset
  function parseSlot(codeString) {
    const code = codeString.split('-')
    const fraction = code.length > 0 ? parseFloat(code[1]) * 0.01 : 0
    return {
      type: parseSlotType(code[0]),
      rotate: (fraction * 360).toString() + 'deg',
      color: parseSlotColor(code.length > 0 ? code[2] : ''),
      slotNum: code.length > 3 ? code[3] : null,
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

    if (code === '') { return '' }

    else {
      try { return ColorsDict[code] } catch (e) { throw new Error('no such code') }
    }
  }
  function parsePiece(slotNum) { //slotIndex = column
    Object.keys(piecePositions).map((c) => {
      // console.log(c, slotNum);
      // return piecePositions[c].map((p, i) => {
      //   if (slotNum === p)
      //     console.log(p, i, slotNum)
      //   return { color: c, id: i, piecePosition: p, onPieceSelect: onPieceSelect }
    }
    )

  }


  return (
    <div style={{ display: "flex", flexDirection: "column", margin: "0" }}>
      {pathCode.map((row, rowIndex) => (
        <div
          key={rowIndex}
          id={rowIndex}
          style={{
            display: "flex",
            justifyContent: "space-between",
            margin: "0",
          }}
        >
          {row.map((slot, slotIndex) => {
            return <Slot
              key={rowIndex * length + slotIndex + 1}
              id={parseSlot(slot).slotNum}
              type={parseSlot(slot).type}
              rotate={parseSlot(slot).rotate}
              color={parseSlot(slot).color}
              piece={parsePiece(parseSlot(slot).slotNum)}
              isOccupied={false}>

            </Slot>;
          }
          )}
        </div>
      ))}
    </div>
  );
};

export default Path;
