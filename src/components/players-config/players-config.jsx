import { useState, useEffect } from 'react';
import './players-config.css';

const PlayersConfig = ({ toStart }) => {
    const [numPlayers, setNumPlayers] = useState(1);
    const [players, setPlayers] = useState([{ name: '', color: '' }]);

    const availableColors = ['Red', 'Blue', 'Green', 'Yellow'];
    // Update players array when number of players changes


    useEffect(() => {
        const newPlayers = [];
        for (let i = 0; i < numPlayers; i++) {
            if (players[i]) {
                newPlayers.push(players[i]);
            } else {
                newPlayers.push({ name: '', color: '' });
            }
        }
        setPlayers(newPlayers);
    }, [numPlayers]);

    // Get available colors for a specific player
    const getAvailableColors = (playerIndex) => {
        const usedColors = players
            .slice(0, playerIndex)
            .map(player => player.color)
            .filter(color => color !== '');

        return availableColors.filter(color => !usedColors.includes(color));
    };
    const isAllPlayersReady = () => {
        return players.every(player => player.name.trim() !== '' && player.color !== '');
    };
    // Handle player name change
    const handleNameChange = (index, name) => {
        const newPlayers = [...players];
        newPlayers[index] = { ...newPlayers[index], name };
        setPlayers(newPlayers);
    };



    // Handle color selection
    const handleColorChange = (index, color) => {
        const newPlayers = [...players];
        newPlayers[index] = { ...newPlayers[index], color };

        // Reset colors for players after this one if their selected color is no longer available
        for (let i = index + 1; i < newPlayers.length; i++) {
            const availableForPlayer = availableColors.filter(c =>
                !newPlayers.slice(0, i).map(p => p.color).filter(col => col !== '').includes(c)
            );

            if (newPlayers[i].color && !availableForPlayer.includes(newPlayers[i].color)) {
                newPlayers[i].color = '';
            }
        }

        setPlayers(newPlayers);
    };

    return (<>

        <div className="players-config-container">
            <h2 className="players-config-title">Player Setup</h2>

            {/* Number of Players Dropdown */}
            <div className="field-group">
                <label className="field-label">
                    Number of Players:
                </label>
                <select
                    value={numPlayers}
                    onChange={(e) => setNumPlayers(parseInt(e.target.value))}
                    className="field-select"
                >
                    <option value={1}>1 Player</option>
                    <option value={2}>2 Players</option>
                    <option value={3}>3 Players</option>
                    <option value={4}>4 Players</option>
                </select>
            </div>

            {/* Player Fields */}
            <div className="player-cards">
                {players.map((player, index) => (
                    <div key={index} className="player-card">
                        <h3 className="player-card-title">
                            Player {index + 1}
                        </h3>

                        <div className="player-card-fields">
                            {/* Player Name Input */}
                            <div>
                                <label className="field-label">
                                    Name:
                                </label>
                                <input
                                    type="text"
                                    value={player.name}
                                    onChange={(e) => handleNameChange(index, e.target.value)}
                                    placeholder={`Enter player ${index + 1} name`}
                                    className="field-input"
                                />
                            </div>

                            {/* Color Selection */}
                            <div>
                                <label className="field-label">
                                    Color:
                                </label>
                                <select
                                    value={player.color}
                                    onChange={(e) => handleColorChange(index, e.target.value)}
                                    className="field-select"
                                >
                                    <option value="">Select a color</option>
                                    {getAvailableColors(index).map(color => (
                                        <option key={color} value={color}>
                                            {color}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Color Preview */}
                        {player.color && (
                            <div className="color-preview-row">
                                <span>Selected color:</span>
                                <div
                                    className="color-dot"
                                    style={{
                                        backgroundColor: player.color.toLowerCase()
                                    }}
                                ></div>
                                <span>{player.color}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="players-summary">
                <h3 className="players-summary-title">Player Summary</h3>
                <div>
                    {players.map((player, index) => (
                        <div key={index} className="players-summary-row">
                            <span>
                                Player {index + 1}: {player.name || 'Unnamed'}
                            </span>
                            <div className="players-summary-color">
                                {player.color && (
                                    <>
                                        <div
                                            className="color-dot-small"
                                            style={{ backgroundColor: player.color.toLowerCase() }}
                                        ></div>
                                        <span>{player.color}</span>
                                    </>
                                )}
                                {!player.color && (
                                    <span className="no-color-text">No color selected</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Confirm Button */}
            <div className="start-button-row">
                <button
                    onClick={toStart}
                    disabled={!isAllPlayersReady()}
                    className="start-game-button"
                >
                    {isAllPlayersReady() ? 'Start Game!' : 'Complete All Player Info'}
                </button>
            </div>
        </div></>
    );
};

export default PlayersConfig;