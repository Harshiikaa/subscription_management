import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";

const navClass = ({ isActive }) =>
  `text-sm ${isActive ? "text-indigo-700 font-medium" : "text-gray-700 hover:text-gray-900"}`;

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="text-lg font-semibold text-indigo-700">SaaS</Link>
        <nav className="flex items-center gap-4">
          <NavLink to="/pricing" className={navClass}>Pricing</NavLink>
          {isAuthenticated && user?.role === "admin" && (
            <NavLink to="/admin" className={navClass}>Admin</NavLink>
          )}
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
              <Button variant="secondary" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navClass}>Login</NavLink>
              <NavLink to="/signup" className={navClass}>Sign Up</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
