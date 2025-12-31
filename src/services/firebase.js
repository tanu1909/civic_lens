// import { getFirestore } from "firebase/firestore";
// import { initializeApp } from "firebase/app";
// import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// const firebaseConfig = {
//   apiKey: "AIzaSyCXZxhQg5On-ik9J4w6eiXrFbfFQqrh-BY",
//   authDomain: "civiclens-hackathon.firebaseapp.com",
//   projectId: "civiclens-hackathon",
//   storageBucket: "civiclens-hackathon.firebasestorage.app",
//   messagingSenderId: "719064968318",
//   appId: "1:719064968318:web:1d405eb44c75342377bc2f"
// };

// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// const provider = new GoogleAuthProvider();

// export const signInWithGoogle = () => {
//   return signInWithPopup(auth, provider);
// };

// export const db = getFirestore(app);


import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
   apiKey: "AIzaSyD2hJ6A9DgjJgH30_U1Z9oXI9hJK89ON_Q",
   authDomain: "civiclens1-hackathon.firebaseapp.com",
   projectId: "civiclens1-hackathon",
   storageBucket: "civiclens1-hackathon.firebasestorage.app",
   messagingSenderId: "10486866322",
   appId: "1:10486866322:web:1ad4274c4bc16a1b09614b"
};

const app = initializeApp(firebaseConfig);

// Initialize Authentication
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
  return signInWithPopup(auth, provider);
};


export const db = getFirestore(app);