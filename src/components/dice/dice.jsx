
const Dice = ({ onRoll }) => {


    const handleRoll = () => {
        const randomRoll = Math.floor(Math.random() * 6) + 1;
        onRoll(randomRoll);
    }
    return (
        <div>

            <button onClick={handleRoll}>Roll the Dice</button>
        </div>
    );
}

export default Dice;