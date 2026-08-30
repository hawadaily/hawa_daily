import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration for Golden Time project
const firebaseConfig = {
  apiKey: "AIzaSyCMMob_J49FuHP5nA5PWQEF66jr0ZDke30",
  authDomain: "hawa-golden-time.firebaseapp.com",
  projectId: "hawa-golden-time",
  storageBucket: "hawa-golden-time.firebasestorage.app",
  messagingSenderId: "293006276869",
  appId: "1:293006276869:web:065d1638905d4700d3df6c",
  measurementId: "G-Q2QQJKVRHJ"
};

// Initialize Firebase
const goldenTimeApp = initializeApp(firebaseConfig, "goldenTimeApp");
const goldenTimeDb = getFirestore(goldenTimeApp);

export { goldenTimeDb as db };
