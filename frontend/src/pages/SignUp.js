import React from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Button from "../components/ui/Button";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useMeta from "../hooks/useMeta";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { signup } = useAuth();
  useDocumentTitle("SaaS - Sign Up");
  useMeta({
    description: "Create your account to start your SaaS subscription.",
  });

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || name.trim().length < 2) {
      setError("Enter a valid name.");
      return;
    }
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Enter a valid email.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await signup({ name, email, password });
      if (res?.success) navigate("/dashboard");
    } catch (_) {
      setError("Could not sign up. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-md px-4 py-12">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <form className="mt-6 space-y-4" onSubmit={handleSignup}>
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm text-gray-700">Name</label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
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
              {loading ? "Creating..." : "Sign Up"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignUp;
