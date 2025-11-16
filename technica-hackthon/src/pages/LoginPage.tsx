import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router";
import type { User } from "firebase/auth";
import "./LoginPage.css";

export default function LoginPage({
  setUser,
}: {
  setUser: (user: User | null) => void;
}) {
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user); // update App state
      navigate("/"); // redirect to dashboard
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
