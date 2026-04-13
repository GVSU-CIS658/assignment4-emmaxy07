import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCsMQ99BoZTotBoknN9uoVBzaGtfXN71Dw",
  authDomain: "beverageshop-72a98.firebaseapp.com",
  projectId: "beverageshop-72a98",
  storageBucket: "beverageshop-72a98.firebasestorage.app",
  messagingSenderId: "100436270031",
  appId: "1:100436270031:web:2d3d83e3a3e4e2310f90ba",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
