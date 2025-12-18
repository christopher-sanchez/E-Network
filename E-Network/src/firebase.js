import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCXUL667p64Mldxl53dW0BV2-1s7DDacM8",
  authDomain: "e-network-96070.firebaseapp.com",
  projectId: "e-network-96070",
  storageBucket: "e-network-96070.appspot.com",
  messagingSenderId: "903825708375",
  appId: "1:903825708375:web:1fd555b44cc26800c09a12",
  measurementId: "G-9G2G6BNK52"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
