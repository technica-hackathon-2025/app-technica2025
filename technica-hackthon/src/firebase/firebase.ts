
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDoPdf6imjVRqLd5YWw0WCZLdHEZFpfOGM",
  authDomain: "technica-hackathon-1d8ff.firebaseapp.com",
  projectId: "technica-hackathon-1d8ff",
  storageBucket: "technica-hackathon-1d8ff.firebasestorage.app",
  messagingSenderId: "727670282778",
  appId: "1:727670282778:web:9ddcb37deb0147dc88cfa3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


const auth = getAuth(app);
const db = getFirestore(app);
// Export auth and db
export { auth, db };

// const googleLogin = document.getElementById("google-button");

// googleLogin?.addEventListener("click", () => {
//   signInWithPopup(auth, provider)
//     .then((result) => {
//       // This gives you a Google Access Token. You can use it to access the Google API.
//       const credential = GoogleAuthProvider.credentialFromResult(result);
//       const token = credential?.accessToken;
//       // The signed-in user info.
//       const user = result.user;
//       console.log("User signed in: ", user);
//     })
//     .catch((error) => {
//       // Handle Errors here.
//       const errorCode = error.code;
//       const errorMessage = error.message;
//       // The email of the user's account used.
//       const email = error.customData.email;
//       // The AuthCredential type that was used.
//       const credential = GoogleAuthProvider.credentialFromError(error);
//       console.error("Error during sign in: ", errorCode, errorMessage);
//     });
// });

