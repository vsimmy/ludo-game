import { useState, useEffect } from 'react';

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

        <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Player Setup</h2>

            {/* Number of Players Dropdown */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Players:
                </label>
                <select
                    value={numPlayers}
                    onChange={(e) => setNumPlayers(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value={1}>1 Player</option>
                    <option value={2}>2 Players</option>
                    <option value={3}>3 Players</option>
                    <option value={4}>4 Players</option>
                </select>
            </div>

            {/* Player Fields */}
            <div className="space-y-4">
                {players.map((player, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">
                            Player {index + 1}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Player Name Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Name:
                                </label>
                                <input
                                    type="text"
                                    value={player.name}
                                    onChange={(e) => handleNameChange(index, e.target.value)}
                                    placeholder={`Enter player ${index + 1} name`}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Color Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Color:
                                </label>
                                <select
                                    value={player.color}
                                    onChange={(e) => handleColorChange(index, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            <div className="mt-3 flex items-center">
                                <span className="text-sm text-gray-600 mr-2">Selected color:</span>
                                <div
                                    className="w-6 h-6 rounded-full border-2 border-gray-300"
                                    style={{
                                        backgroundColor: player.color.toLowerCase()
                                    }}
                                ></div>
                                <span className="ml-2 text-sm font-medium">{player.color}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Player Summary</h3>
                <div className="space-y-1">
                    {players.map((player, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <span className="text-blue-700">
                                Player {index + 1}: {player.name || 'Unnamed'}
                            </span>
                            <div className="flex items-center">
                                {player.color && (
                                    <>
                                        <div
                                            className="w-4 h-4 rounded-full mr-2 border border-gray-300"
                                            style={{ backgroundColor: player.color.toLowerCase() }}
                                        ></div>
                                        <span className="text-blue-700 text-sm">{player.color}</span>
                                    </>
                                )}
                                {!player.color && (
                                    <span className="text-gray-500 text-sm">No color selected</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Confirm Button */}
            <div className="mt-6 flex justify-center">
                <button
                    onClick={toStart}
                    disabled={!isAllPlayersReady()}
                    className={`px-8 py-3 rounded-lg font-semibold text-white shadow-lg transition-all duration-200 ${isAllPlayersReady()
                        ? 'bg-green-500 hover:bg-green-600 hover:shadow-xl transform hover:-translate-y-1'
                        : 'bg-gray-400 cursor-not-allowed'
                        }`}
                >
                    {isAllPlayersReady() ? 'Start Game!' : 'Complete All Player Info'}
                </button>
            </div>
        </div></>
    );
};

export default PlayersConfig;