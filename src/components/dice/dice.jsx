import { useState } from "react";
const Dice = ({ onRoll }) => {
    const [roll, setRoll] = useState(0);

    const handleRoll = () => {
        const randomRoll = Math.floor(Math.random() * 6) + 1;
        setRoll(randomRoll);
        onRoll(roll);
    }
    return (
        <div>
            <p>Roll: {roll}</p>
            <button onClick={handleRoll}>Roll the Dice</button>
        </div>
    );
}

export default Dice;