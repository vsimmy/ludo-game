import Dice from "../dice/dice";
import { useState } from "react";
import { PieceColor } from "../ludo.type.ts";

const GameControl = () => {
    const [roll, setRoll] = useState(0);
    const [turn, setTurn] = useState('blue');
    const [sixRoll, setSixRoll] = useState(0);
    const [returnHome, setReturnHome] = useState(false);
    const handleDiceRoll = (rollValue) => {
        setRoll(rollValue);
        getTurn(rollValue);
    }
    const getTurn = (roll) => {
        const colors = Object.values(PieceColor);
        let count = colors.indexOf(turn);
        if (roll !== 6) {
            setTurn(colors[(count + 1) % 4]);

        } else {
            if (sixRoll < 3) {
                setSixRoll(sixRoll => sixRoll + 1);
            } else {
                setSixRoll(0);
                setTurn(colors[(count + 1) % 4]);
                setReturnHome(true);
            }

        }
        console.log(turn)

    }

    return (

        <div>
            <Dice onRoll={handleDiceRoll} />
        </div>
    )
}

export default GameControl;