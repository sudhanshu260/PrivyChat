import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInAnonymously, 
    signInWithCustomToken, 
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    collection, 
    addDoc, 
    onSnapshot, 
    query,
    serverTimestamp,
    deleteDoc,
    Timestamp
} from 'firebase/firestore';

// ✅ YOUR NEW FIREBASE CONFIG (Updated)
const firebaseConfig = {
  apiKey: "AIzaSyC7XYMrzPkIqLY_3qOGslQLEDCjNKbfbEA",
  authDomain: "privyai-chat.firebaseapp.com",
  projectId: "privyai-chat",
  storageBucket: "privyai-chat.firebasestorage.app",
  messagingSenderId: "513999137100",
  appId: "1:513999137100:web:257884d5e0c1940b0307e9"
};

// ✅ USE YOUR Firebase App ID (required for Firestore paths)
const appId = firebaseConfig.appId;

// --- Initialize Firebase ---
let app, auth, db;
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
} catch (e) {
    console.error("Error initializing Firebase:", e);
}

// --- Firestore Path Helpers ---
const getRoomCollectionPath = () => `/artifacts/${appId}/public/data/chatRooms`;
const getRoomDocPath = (roomId) => `${getRoomCollectionPath()}/${roomId}`;
const getMessagesCollectionPath = (roomId) => `${getRoomDocPath(roomId)}/messages`;
const getParticipantsCollectionPath = (roomId) => `${getRoomDocPath(roomId)}/participants`;

// --- Exports ---
export {
    auth,
    db,
    // Auth functions
    signInAnonymously,
    signInWithCustomToken,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,

    // Firestore functions
    doc,
    setDoc,
    collection,
    addDoc,
    onSnapshot,
    query,
    serverTimestamp,
    deleteDoc,
    Timestamp,

    // Path helpers
    getRoomCollectionPath,
    getMessagesCollectionPath,
    getParticipantsCollectionPath
};
