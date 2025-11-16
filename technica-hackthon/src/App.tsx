import { useState, useEffect } from 'react'
import { onAuthStateChanged, type User } from "firebase/auth";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import './App.css';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Gemini from './pages/Gemini';
import Closet from './pages/Closet';
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
            <Route path="/" element={user ? <Dashboard setUser={user}/> : <Navigate to="login" replace/>} />
            <Route path="/closet" element={<Closet />} />
            <Route path="/gemini" element={<Gemini />} />
          </Routes>
        </BrowserRouter>
      );
    }

export default App;