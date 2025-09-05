import { signInWithPopup } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, facebookProvider, googleProvider } from "../firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Login with:", email, password);
    // baad me yahan backend call aayega
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken(); // 👈 Firebase ID Token
      console.log("ID Token:", token);

      // backend ko bhej
      const res = await fetch("http://localhost:5000/api/auth/google-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      console.log("Backend response:", data);
      if (data.success) {
        localStorage.setItem("authToken", data.data.tokens.accessToken); // ✅ token save
        navigate("/dashboard"); // ✅ redirect to dashboard
      }
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      // 1. Facebook popup open hoga
      const result = await signInWithPopup(auth, facebookProvider);

      // 2. Firebase se ID token nikaal
      const token = await result.user.getIdToken();

      // 3. Backend ko bhej
      const res = await fetch("http://localhost:5000/api/auth/facebook-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      // 4. Backend ka response
      const data = await res.json();
      console.log("Backend response:", data);

      if (data.success) {
        // JWT token ya pura user data store kar
        localStorage.setItem("authData", JSON.stringify(data.data));

        // 5. Redirect dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Facebook login error:", err);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button type="submit">Login</button>
      </form>
      <button onClick={handleGoogleLogin}>Login with Google</button>
      <button onClick={handleFacebookLogin}>Login with Facebook</button>
    </div>
  );
};

export default Login;
