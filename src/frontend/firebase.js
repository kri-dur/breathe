import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";

// Replace with your own config
const firebaseConfig = {
  apiKey: "AIzaSyBNE7pYCmHhssiVAF8cTi5TtM1M3dE66dg",
  authDomain: "breathe-app-e86eb.firebaseapp.com",
  projectId: "breathe-app-e86eb",
  storageBucket: "breathe-app-e86eb.firebasestorage.app",
  messagingSenderId: "870165329113",
  appId: "1:870165329113:web:367cfca042a317f2c57ac8",
  measurementId: "G-EW48WVNQK5"
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);