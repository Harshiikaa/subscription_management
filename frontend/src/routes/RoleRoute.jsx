import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleRoute = ({ allow = [] }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!allow.includes(user?.role)) return <Navigate to="/" replace />;
  return <Outlet />;
};

export default RoleRoute;
