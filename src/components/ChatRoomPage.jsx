import { useState, useEffect, useRef } from 'react';
import {
    db,
    collection,
    addDoc,
    onSnapshot,
    query,
    serverTimestamp,
    deleteDoc,
    doc,
    getMessagesCollectionPath,
    getParticipantsCollectionPath
} from '../firebase';
import CryptoHelper from '../utils/crypto';
import Modal from './common/Modal';
import Loading from './common/Loading';
import { LogOut, Key, Users, Copy, Send, ShieldAlert } from 'lucide-react'; // AI UPDATE: Added ShieldAlert

// AI UPDATE: Import TensorFlow.js and the toxicity model
import * as tf from '@tensorflow/tfjs';
import * as toxicity from '@tensorflow-models/toxicity';

/**
 * Module 3, 4, 5 + AI Intelligence Layer
 */
function ChatRoomPage({ user, roomId, secretKey, onLeave, isNewRoom }) {
    const [derivedKey, setDerivedKey] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [userCount, setUserCount] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingText, setLoadingText] = useState('Deriving encryption key...');
    const [showSecretModal, setShowSecretModal] = useState(isNewRoom);
    
    // AI UPDATE: State to hold the loaded toxicity model
    const [toxicityModel, setToxicityModel] = useState(null);

    const messagesEndRef = useRef(null);
    const participantDocId = useRef(null);

    // AI UPDATE: Load the toxicity model on component mount
    useEffect(() => {
        setLoadingText('Loading AI security model...');
        
        // The 0.9 threshold means we're fairly confident in the prediction
        const threshold = 0.9; 
        
        toxicity.load(threshold, ['toxicity', 'severe_toxicity', 'identity_attack', 'insult', 'threat'])
            .then(model => {
                setToxicityModel(model);
                setLoadingText('Deriving encryption key...');
            })
            .catch(err => {
                console.error("Failed to load AI model", err);
                // Even if AI fails, the chat should work.
                setToxicityModel(null); 
            });
    }, []);


    // 1. Derive the encryption key from the secret
    useEffect(() => {
        const initKey = async () => {
            try {
                setError('');
                setLoading(true);
                const key = await CryptoHelper.deriveKey(secretKey);
                setDerivedKey(key);
            } catch (e) {
                setError(e.message);
            }
        };
        initKey();
    }, [secretKey]);

    // AI UPDATE: New function to analyze message content
    const analyzeMessage = async (text) => {
        if (!toxicityModel) {
            return { isToxic: false, threatLabel: null };
        }

        const predictions = await toxicityModel.classify([text]);
        
        for (const prediction of predictions) {
            if (prediction.results[0].match) {
                return { isToxic: true, threatLabel: prediction.label };
            }
        }
        return { isToxic: false, threatLabel: null };
    };

    // 2. Set up presence (user count) and message listeners
    useEffect(() => {
        if (!derivedKey || !roomId || !toxicityModel) { // AI UPDATE: Wait for model to load
            if (derivedKey && !toxicityModel) {
                // This handles the case where the model failed to load
                // We can proceed without it
                console.warn("AI model not loaded. Chat proceeding without threat detection.");
            } else {
                return;
            }
        }

        setLoading(false);
        setLoadingText('');

        // --- Presence (Module 5: User Count) ---
        const participantsCol = collection(db, getParticipantsCollectionPath(roomId));
        
        const addParticipant = async () => {
            try {
                const docRef = await addDoc(participantsCol, {
                    uid: user.uid,
                    email: user.email,
                    joined: serverTimestamp()
                });
                participantDocId.current = docRef.id;
            } catch (e) { console.error("Error adding participant:", e); }
        };
        addParticipant();
        
        const unsubscribeParticipants = onSnapshot(participantsCol, 
            (snapshot) => setUserCount(snapshot.size),
            (err) => console.error("Error listening to participants:", err)
        );

        // --- Message Listener ---
        const messagesCol = collection(db, getMessagesCollectionPath(roomId));
        const q = query(messagesCol);

        const unsubscribeMessages = onSnapshot(q, 
            async (snapshot) => {
                const newMessages = [];
                for (const doc of snapshot.docs) {
                    const data = doc.data();
                    let decryptedText;
                    let threatInfo = { isToxic: false, threatLabel: null };
                    
                    try {
                        decryptedText = await CryptoHelper.decryptMessage(derivedKey, data.text);
                        
                        // AI UPDATE: Analyze the message *after* decryption
                        if (decryptedText) {
                            threatInfo = await analyzeMessage(decryptedText);
                        }

                    } catch (e) {
                        console.error("Failed to decrypt a message:", e);
                        decryptedText = "[Message decryption failed]";
                    }
                    
                    newMessages.push({
                        id: doc.id,
                        ...data,
                        text: decryptedText,
                        timestamp: data.timestamp,
                        isToxic: threatInfo.isToxic, // AI UPDATE: Store threat info
                        threatLabel: threatInfo.threatLabel // AI UPDATE: Store threat info
                    });
                }
                newMessages.sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));
                setMessages(newMessages);
            },
            (err) => {
                console.error("Error listening to messages:", err);
                setError("Could not fetch messages. Is the Room ID correct?");
            }
        );

        // Cleanup on unmount
        return () => {
            unsubscribeParticipants();
            unsubscribeMessages();
            if (participantDocId.current) {
                deleteDoc(doc(db, getParticipantsCollectionPath(roomId), participantDocId.current))
                    .catch(e => console.error("Error removing participant:", e));
            }
        };

    }, [derivedKey, roomId, user.uid, user.email, toxicityModel]); // AI UPDATE: Added toxicityModel dependency

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle sending a message
    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !derivedKey) return;

        const currentMsg = newMessage;
        setNewMessage('');

        try {
            const encryptedText = await CryptoHelper.encryptMessage(derivedKey, currentMsg);
            await addDoc(collection(db, getMessagesCollectionPath(roomId)), {
                text: encryptedText,
                senderEmail: user.email,
                senderUid: user.uid,
                timestamp: serverTimestamp()
            });
        } catch (e) {
            console.error("Error sending message:", e);
            setError("Failed to send message.");
            setNewMessage(currentMsg);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).catch(err => {
            console.error('Failed to copy: ', err);
            try {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            } catch (e2) {
                console.error('Fallback copy failed: ', e2);
            }
        });
    };

    if (loading) {
        return <Loading text={loadingText} />; // AI UPDATE: Use dynamic loading text
    }
    
    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <p className="text-2xl text-red-400 mb-6">{error}</p>
                <button
                    onClick={onLeave}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                    <LogOut size={18} /> Back to Menu
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col">
            {/* Header */}
            <header className="bg-gray-800 shadow-md p-4 flex justify-between items-center z-10">
                <div>
                    <h2 className="text-xl font-bold">Room: <span className="font-mono text-blue-300">{roomId}</span></h2>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Users size={16} />
                        <span>{userCount} {userCount === 1 ? 'user' : 'users'} online</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowSecretModal(true)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Key size={18} /> Room Info
                    </button>
                    <button
                        onClick={onLeave}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <LogOut size={18} /> Leave
                    </button>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 bg-gray-900">
                {messages.length === 0 ? (
                    <p className="text-center text-gray-400">No messages yet. Send one!</p>
                ) : (
                    messages.map(msg => (
                        <div 
                            key={msg.id} 
                            className={`flex mb-3 ${msg.senderUid === user.uid ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`p-3 rounded-lg max-w-lg shadow relative ${
                                msg.senderUid === user.uid 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-700 text-white'
                            }`}>
                                
                                {/* AI UPDATE: Show warning if message is toxic */}
                                {msg.isToxic && (
                                    <div className="absolute -top-2 -left-2" title={`AI Warning: Potential ${msg.threatLabel}`}>
                                        <ShieldAlert size={20} className="text-yellow-300 bg-red-600 rounded-full p-0.5" />
                                    </div>
                                )}
                                
                                <p className="text-sm font-bold mb-1 opacity-70">{msg.senderEmail}</p>
                                <p className="text-base whitespace-pre-wrap break-words">{msg.text}</p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </main>

            {/* Input Area */}
            <footer className="bg-gray-800 p-4">
                <form onSubmit={handleSend} className="flex gap-4">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type your encrypted message..."
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-lg transition-colors"
                        aria-label="Send Message"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </footer>

            {/* Room Info Modal */}
            <Modal show={showSecretModal} onClose={() => setShowSecretModal(false)} title="Share This Room">
                <p className="text-gray-300 mb-6">
                    To let others join, you MUST share <span className="font-bold">both</span> the Room ID and the Secret Key.
                    The key is <span className="font-bold text-red-400">never</span> stored on the server.
                </p>
                
                <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-bold mb-2">Room ID</label>
                    <div className="flex">
                        <input type="text" readOnly value={roomId} className="flex-1 p-2 font-mono bg-gray-700 rounded-l-lg border border-gray-600 text-gray-200" />
                        <button onClick={() => copyToClipboard(roomId)} className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg flex items-center">
                            <Copy size={18} />
                        </button>
                    </div>
                </div>
                <div className="mb-6">
                    <label className="block text-gray-300 text-sm font-bold mb-2">Secret Key</label>
                    <div className="flex">
                        <input type="text" readOnly value={secretKey} className="flex-1 p-2 font-mono bg-gray-700 rounded-l-lg border border-gray-600 text-gray-200" />
                        <button onClick={() => copyToClipboard(secretKey)} className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg flex items-center">
                            <Copy size={18} />
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default ChatRoomPage;