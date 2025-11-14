PrivyAI Chat

PrivyAI Chat is an AI-powered, secure messaging platform that features end-to-end encryption (E2EE). This project is a high-performance web application built with React, Vite, and Firebase, designed to ensure that user conversations are both private and safe.

The server (Firebase) only ever stores encrypted ciphertext, meaning no one—not even the database administrator—can read the messages. All decryption and safety analysis happens securely on the user's own device.

Features

User Authentication: Full login and sign-up capabilities using email and password (via Firebase Auth).

Secure Room Creation: Generate unique, private chat rooms.

Join Secure Rooms: Access rooms only with a Room ID and the corresponding Secret Key.

True End-to-End Encryption (E2EE): All messages are encrypted and decrypted in the browser using the WebCrypto API (AES-GCM). The Secret Key is never stored on the server.

Real-time User Presence: See how many users are currently active in the chat room (Module 5).

Client-Side AI Threat Detection: Uses TensorFlow.js to analyze decrypted messages in real-time. The app warns the user of potential toxicity, insults, or threats without the message ever leaving their device for analysis.

Tech Stack

Frontend: React, Vite

Backend & Database: Firebase (Authentication & Firestore)

Styling: Tailwind CSS

Encryption: WebCrypto API (PBKDF2 & AES-GCM)

AI/ML: TensorFlow.js (@tensorflow/tfjs, @tensorflow-models/toxicity)

Getting Started

Follow these instructions to get the project running on your local machine for development and testing.

Prerequisites

You must have the following software installed:

Node.js and npm: Download Node.js (npm is included)

A Firebase Account: Create one for free

1. Clone & Install

First, clone the repository (or download and unzip the files) to your local machine.

# Clone the repository
git clone [https://github.com/your-username/privyai-chat.git](https://github.com/your-username/privyai-chat.git)

# Navigate into the project directory
cd privyai-chat

# Install all the project dependencies
npm install


2. Set Up Firebase

This is the most important step. The app will not run without a valid Firebase project.

Go to the Firebase Console.

Click "+ Add project" and give it a name (e.g., "PrivyAI Chat").

Once your project is created, click the Web icon (</>) to register a new web app.

Give it a nickname (e.g., "Web App") and click "Register app".

Firebase will show you a firebaseConfig object. Copy this object.

// Example config
const firebaseConfig = {
  apiKey: "AIzaSy...YOUR_API_KEY",
  authDomain: "privyai-chat-123.firebaseapp.com",
  projectId: "privyai-chat-123",
  storageBucket: "privyai-chat-123.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcd..."
};


Open the project in your code editor and find the file: src/firebase.js.

Paste your firebaseConfig object into this file, replacing the placeholder.

3. Enable Firebase Services

In the Firebase console for your new project:

Authentication:

Go to Authentication (from the "Build" menu).

Click the "Sign-in method" tab.

Click on "Email/Password" and Enable it. Click Save.

Firestore Database:

Go to Firestore Database (from the "Build" menu).

Click "Create database".

Select "Start in test mode". (This is fine for development).

Choose a location and click Enable.

4. Run the App

You are all set! Now, run the local development server:

npm run dev


Your terminal will show you a local URL. Open it in your browser:

➜ Local: http://localhost:5173/

You can now create an account, start a chat room, and test the E2EE and AI features.

How It Works

End-to-End Encryption (E2EE)

When a user creates a room, they are given a roomId (public) and a secretKey (private).

The secretKey is a simple password. We use PBKDF2 to derive a strong, unguessable CryptoKey from it.

This CryptoKey never leaves the user's browser.

When sending a message, the text is encrypted with AES-GCM using this CryptoKey.

The encrypted text (ciphertext) is sent to Firebase.

When receiving a message, the ciphertext is downloaded, decrypted with the same CryptoKey, and then displayed.

Result: The Firebase database only contains unreadable, encrypted gibberish.

AI Security

The TensorFlow.js toxicity model is loaded directly into the user's browser.

After a message is received and decrypted (as seen above), the plain text is passed to the AI model.

The model analyzes the text locally for threats, toxicity, etc.

If a threat is found, a warning icon is displayed next to the message.

Result: No private, decrypted data is ever sent to a third-party server for analysis, preserving the E2EE promise.