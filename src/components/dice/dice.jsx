const PIP_LAYOUTS = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
}

const Dice = ({ value, isRolling }) => {
  const face = value && value >= 1 && value <= 6 ? value : 1
  return (
    <div className={`dice-face${isRolling ? ' dice-rolling' : ''}`}>
      <svg viewBox="0 0 100 100" width="40" height="40">
        <rect x="4" y="4" width="92" height="92" rx="16" className="dice-body" />
        {PIP_LAYOUTS[face].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="8" className="dice-pip" />
        ))}
      </svg>
    </div>
  );
}

export default Dice;