🚀 PrivybChat

Privy Chat is an end-to-end encrypted (E2EE) messaging platform built with React, Vite, and Firebase.
It ensures complete privacy by encrypting all messages before they leave the user’s device—meaning even Firebase only stores unreadable ciphertext.

All decryption and AI safety checks happen locally in the browser, preserving user privacy while still providing intelligent threat detection.

🔐 Key Features
🔑 1. End-to-End Encryption (E2EE)

Encryption & decryption happen inside the browser using AES-GCM.

Secret Key → converted to a strong AES key using PBKDF2.

Firebase never sees plaintext—only encrypted ciphertext is stored.

👤 2. User Authentication

Full sign-up and login system using Firebase Auth (Email + Password).

🏠 3. Secure Room Creation

Users can create private chat rooms with:

Room ID (public)

Secret Key (private − required for decryption)

🔗 4. Join Secure Rooms

Users can only join rooms if they have both:

The Room ID

The Secret Key

👀 5. Real-Time Presence Tracking

Shows how many users are currently active in the chat room.



🧰 Tech Stack
Area	Technology
Frontend	React, Vite
Backend / DB	Firebase (Auth + Firestore)
Styling	Tailwind CSS
Encryption	WebCrypto API – PBKDF2 + AES-GCM
AI	TensorFlow.js (@tensorflow/tfjs, @tensorflow-models/toxicity)

📥 1. Clone & Install
# Clone the repository
git clone https://github.com/sudhanshu260/PrivyChat.git

# Move into the project
cd PrivyChat

# Install dependencies
npm install

🔧 2. Configure Firebase
Step 1: Create a Firebase Project

Go to Firebase Console

Click Add Project → choose a name (example: PrivyChat)

After project creation, click the Web App (</>) icon

Register your app → you will receive firebaseConfig

Example:
const firebaseConfig = {
  apiKey: "AIzaSy...YOUR_KEY",
  authDomain: "privy-chat.firebaseapp.com",
  projectId: "privy-chat",
  storageBucket: "privy-chat.appspot.com",
  messagingSenderId: "123456",
  appId: "1:123456:web:abc123"
};

Step 2: Add config to the project

Replace the placeholder config in: src/firebase.js

🔥 3. Enable Required Firebase Services
✔ Enable Authentication

Go to Authentication → Sign-In Method

Enable Email/Password

✔ Enable Firestore

Go to Firestore Database

Click Create Database

Select Start in test mode (for development)

▶️ 4. Run the App
npm run dev

🔐 How It Works (Security Overview)
✔ End-to-End Encryption
1. Room Creation

User gets:

roomId

secretKey

2. Key Derivation

The secretKey is converted into a strong AES key using:
PBKDF2 + SHA-256 + 100,000 iterations

This key:

never leaves the browser

is not stored on Firebase

is not shared with the server

3. Sending a Message
Plaintext → Encrypt → AES-GCM ciphertext → Firestore

4. Receiving a Message

Ciphertext → Decrypt (local) → Display in UI
📁 Project Structure

src/
│── components/
│── firebase/
│── utils/
│── ai/
│── styles/
│── App.jsx
│── main.jsx


🙌 Contributions

PRs and suggestions are welcome!

📜 License

MIT License
