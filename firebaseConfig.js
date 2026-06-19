// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBdHff_0RTeRr7m_AqTXVbcf5dwjFjXevY",
  authDomain: "safesteps-ba7a7.firebaseapp.com",
  databaseURL: "https://safesteps-ba7a7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "safesteps-ba7a7",
  storageBucket: "safesteps-ba7a7.firebasestorage.app",
  messagingSenderId: "521812429255",
  appId: "1:521812429255:web:d4ad63a1016d6f4dc871e2",
  measurementId: "G-KRCZKQVCZM"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
