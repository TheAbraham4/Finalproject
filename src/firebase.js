import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Replace the values below with your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyDUVndeTtls4ePP6DToABObZp2w30y9TY0",
  authDomain: "abrahamres.firebaseapp.com",
  projectId: "abrahamres",
  storageBucket: "abrahamres.firebasestorage.app",
  messagingSenderId: "620216946710",
  appId: "1:620216946710:web:c8fe74af8375e9d9ede537",
  measurementId: "G-BXTEDPM0YE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };