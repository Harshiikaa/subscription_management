import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Button from "../components/ui/Button";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useMeta from "../hooks/useMeta";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  useDocumentTitle("SaaS - Login");
  useMeta({
    description: "Login to manage your SaaS subscription and billing.",
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Enter a valid email.");
      return;
    }
    if (!password || password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await login({ email, password });
      if (res?.success) navigate("/dashboard");
    } catch (_) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-md px-4 py-12">
          <h1 className="text-2xl font-bold">Login</h1>
          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm text-gray-700">Email</label>
              <input
                type="email"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-700">
                Password
              </label>
              <input
                type="password"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button disabled={loading} className="w-full">
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-indigo-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
