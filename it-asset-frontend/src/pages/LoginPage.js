import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import officeAnimation from "../animations/Rocket research.json";
import { motion } from "framer-motion"; // Import motion

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError("❌ Invalid username or password. Please try again.");
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3]">
      {/* --- Left Side: Animation / Branding --- */}
      <div className="hidden lg:flex w-1/2 text-white flex-col items-center justify-center p-12 text-center">
        <Lottie
          animationData={officeAnimation}
          loop={true}
          className="w-full max-w-md mb-6 drop-shadow-lg"
        />
        <h1 className="text-5xl font-extrabold mb-3 tracking-tight drop-shadow-md">
          IT COMMAND
        </h1>
        <p className="text-blue-100 text-lg">
          Manage your IT assets and operations seamlessly.
        </p>
      </div>

      {/* --- Right Side: Login Form --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <motion.div // Changed div to motion.div
          initial={{ opacity: 0, scale: 0.95 }} // Initial state
          animate={{ opacity: 1, scale: 1 }} // Animation state
          transition={{ duration: 0.5, ease: "easeOut" }} // Animation duration and easing
          className="bg-white/90 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-full max-w-md"
        >
          <h2 className="text-3xl font-bold text-center text-[#0d47a1] mb-8">
            LOGIN
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="text-red-700 bg-red-100 p-3 rounded-lg text-center text-sm font-semibold">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1976d2] focus:border-[#1976d2] transition"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-[#1976d2] focus:ring-[#1976d2] border-gray-300 rounded mr-2"
                />
                Remember me
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#0d47a1] via-[#1976d2] to-[#2196f3] hover:opacity-90 text-white font-semibold text-lg rounded-lg transition-all transform hover:scale-[1.02] shadow-md"
            >
              Sign In
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default LoginPage;