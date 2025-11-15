import { Link } from "react-router-dom";
const Navbar = () => {
  return (
    <div>
    <nav className="website">
      <div>
         <Link to="/" className="navbar-link">
              Dashboard
            </Link>

            <Link to= "/closet">Closet</Link>
            </div>
    </nav>
    </div>
  );
};

export default Navbar;