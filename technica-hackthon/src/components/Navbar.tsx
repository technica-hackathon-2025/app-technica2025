import { Link } from "react-router";
import "./Navbar.css";
export default function Navbar() {
  return (
    <div className="navbar-outer">
    <nav id ="navbar">

        <div className ="navbar-links">
          <Link to="/">Dashboard</Link>
        </div>
        <div className="navbar-link">
          <Link to="/closet">Closet</Link>
        </div>
        <div className="navbar-link">
          <Link to="/gemini">Gemini</Link>
        </div>
        <div className="navbar-link">
          <Link to="/login">Login</Link>
        </div>
    </nav>
    </div>
  );
}