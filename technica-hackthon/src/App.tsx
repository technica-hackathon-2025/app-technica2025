import { useState, useEffect } from 'react'
import { onAuthStateChanged, type User } from "firebase/auth";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter, Navigate, Route, Routes } from "react-router";import './App.css'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard';
import { auth } from './firebase/firebase';
    
  function App() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
      const unsub = onAuthStateChanged(auth, (user) => {
        setUser(user);
      });
      return unsub;
    }, []);

      return (
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage setUser={setUser} />} />
            <Route path="/" element={user ? <Dashboard setUser={setUser}/> : <Navigate to="login" replace/>} />
          </Routes>
        </BrowserRouter>
      );
    }

export default App;