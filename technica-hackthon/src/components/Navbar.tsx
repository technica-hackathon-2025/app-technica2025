import { Link } from "react-router";

export default function Navbar() {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Dashboard</Link>
        </li>
        <li>
          <Link to="/closet">Closet</Link>
        </li>
      </ul>
    </nav>
  );
}