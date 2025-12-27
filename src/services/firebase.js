import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCXZxhQg5On-ik9J4w6eiXrFbfFQqrh-BY",
  authDomain: "civiclens-hackathon.firebaseapp.com",
  projectId: "civiclens-hackathon",
  storageBucket: "civiclens-hackathon.firebasestorage.app",
  messagingSenderId: "719064968318",
  appId: "1:719064968318:web:1d405eb44c75342377bc2f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
  return signInWithPopup(auth, provider);
};