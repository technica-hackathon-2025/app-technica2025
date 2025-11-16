import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { useNavigate } from "react-router";
import type { User } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import "./LoginPage.css";

export default function LoginPage({
  setUser,
}: {
  setUser: (user: User | null) => void;
}) {
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const saveUserToFirestore = async (user: User) => {
    const userRef = doc(db, "users", user.uid);

    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        provider: "google",
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(), // will only matter on first write
      },
      { merge: true } // don't overwrite existing fields
    );
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 1) save user in Firestore
      await saveUserToFirestore(user);

      // 2) update React state in App.tsx
      setUser(user);

      // 3) go to dashboard/home
      navigate("/");
    } catch (err) {
      alert("Google sign-in failed.");
      console.error(err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Sign in to continue</p>

        <button className="login-button" onClick={handleGoogleSignIn}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
