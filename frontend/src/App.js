import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import Pricing from "./pages/Pricing";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PaymentCallbackEsewa from "./pages/PaymentCallbackEsewa";
import PaymentCallbackImePay from "./pages/PaymentCallbackImePay";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import AnalyticsListener from "./components/AnalyticsListener";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <AnalyticsListener />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/payments/esewa/callback"
              element={<PaymentCallbackEsewa />}
            />
            <Route
              path="/payments/imepay/callback"
              element={<PaymentCallbackImePay />}
            />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<UserDashboard />} />
            </Route>

            <Route element={<RoleRoute allow={["admin"]} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
