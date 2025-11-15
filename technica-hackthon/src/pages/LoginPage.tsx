import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router";
import type { User } from "firebase/auth";

export default function LoginPage({ setUser }: { setUser: (user: User) => void }) {
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user); // Update user in App.tsx
      navigate("/"); // Redirect to dashboard/home
    } catch (err) {
      alert("Google sign-in failed.");
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>
    </div>
  );
}