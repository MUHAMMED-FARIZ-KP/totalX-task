// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB__UU_y7h0WvSdA3EbS8IZg2u_Q_zUrqw",
  authDomain: "totalx-bd74f.firebaseapp.com",
  projectId: "totalx-bd74f",
  storageBucket: "totalx-bd74f.firebasestorage.app",
  messagingSenderId: "833057206572",
  appId: "1:833057206572:web:f9b2fefa4234220ca83c89",
  measurementId: "G-QCZM50JZSC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = 'en';

export { auth, RecaptchaVerifier, signInWithPhoneNumber };