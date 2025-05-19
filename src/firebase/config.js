import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBaDqPXY0sffnHJvewmy4t7RZCuFJPf5TY",
  authDomain: "bux-75da0.firebaseapp.com",
  projectId: "bux-75da0",
  storageBucket: "bux-75da0.firebasestorage.app",
  messagingSenderId: "718425905284",
  appId: "1:718425905284:web:5ee328332dd5cc1a61cad1",
  measurementId: "G-H2939Z2DZB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Create a secondary app for user management (won't affect current auth state)
const secondaryApp = initializeApp(firebaseConfig, "secondary");
const secondaryAuth = getAuth(secondaryApp);

export { auth, secondaryAuth, db, storage }; 