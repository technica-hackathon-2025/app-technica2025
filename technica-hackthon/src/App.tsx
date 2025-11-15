import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
//IMPLEMENT ROUTES

/*<BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Dashboard user={user}/> : <Navigate to="login" replace/>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/MentalHealthTracking" element={user ? <MentalHealthTracking user={user} /> : <Navigate to="login" replace/>}/>
        <Route path="/JournalingPrompts" element={user ? <JournalingPrompts user={user} /> : <Navigate to="login" replace/>}/>
        <Route path="/MusicPlaylists" element={<MusicPlaylists />} />
      </Routes>
    </BrowserRouter> */ //something liek this

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
