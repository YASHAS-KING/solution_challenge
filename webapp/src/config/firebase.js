import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA-rSQzqQC48zn82yJA8CsYvaA0ph1MY6Q",
  authDomain: "crisis-sync-e0da3.firebaseapp.com",
  projectId: "crisis-sync-e0da3",
  storageBucket: "crisis-sync-e0da3.firebasestorage.app",
  messagingSenderId: "403401633412",
  appId: "1:403401633412:web:f2bf9848104f533b2b1cd1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
