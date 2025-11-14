import { useState } from 'react';
import Modal from './common/Modal';

/**
 * Module 2: Main Menu (Create/Join)
 */
function MenuPage({ user, onJoin, onCreate }) {
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinRoomId, setJoinRoomId] = useState('');
    const [joinSecretKey, setJoinSecretKey] = useState('');
    const [joinError, setJoinError] = useState('');

    const handleCreateRoom = () => {
        // Generate a random, human-readable-ish room ID
        const randomId = Math.random().toString(36).substring(2, 9);
        // Generate a strong, random secret key
        const randomKey = crypto.randomUUID() + crypto.randomUUID();
        
        onCreate(randomId, randomKey);
    };

    const handleJoinSubmit = (e) => {
        e.preventDefault();
        if (!joinRoomId.trim() || !joinSecretKey.trim()) {
            setJoinError('Room ID and Secret Key are required.');
            return;
        }
        setJoinError('');
        onJoin(joinRoomId, joinSecretKey);
    };

    const Card = ({ title, description, onClick, cta }) => (
        <div 
            className="bg-gray-800 p-8 rounded-lg shadow-xl flex flex-col justify-between
                       transition-all duration-300 ease-in-out transform 
                       hover:scale-105 hover:shadow-2xl hover:bg-gray-700"
        >
            <div>
                <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
                <p className="text-gray-400 mb-6">{description}</p>
            </div>
            <button
                onClick={onClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-lg transition-colors duration-200"
            >
                {cta}
            </button>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-white mb-2">Welcome, {user.email}</h1>
                <p className="text-xl text-gray-400">Start a secure conversation.</p>
            </div>
            
            <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
                {/* Module 2.i: Create Room */}
                <Card
                    title="Create Room"
                    description="Start a new, secure, end-to-end encrypted chat room."
                    onClick={handleCreateRoom}
                    cta="Create New Room"
                />
                {/* Module 2.ii: Join Room */}
                <Card
                    title="Join Room"
                    description="Join an existing room using a Room ID and Secret Key."
                    onClick={() => setShowJoinModal(true)}
                    cta="Join Existing Room"
                />
            </div>
            
            {/* Join Room Modal */}
            <Modal show={showJoinModal} onClose={() => { setShowJoinModal(false); setJoinError(''); }} title="Join Room">
                <form onSubmit={handleJoinSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="joinRoomId">
                            Room ID
                        </label>
                        <input
                            type="text"
                            id="joinRoomId"
                            value={joinRoomId}
                            onChange={(e) => setJoinRoomId(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="friends-chat-123"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="joinSecretKey">
                            Secret Key
                        </label>
                        <input
                            type="password"
                            id="joinSecretKey"
                            value={joinSecretKey}
                            onChange={(e) => setJoinSecretKey(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter the shared secret"
                            required
                        />
                    </div>
                    {joinError && <p className="text-red-400 text-sm mb-4">{joinError}</p>}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => { setShowJoinModal(false); setJoinError(''); }}
                            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                            Join Room
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default MenuPage;