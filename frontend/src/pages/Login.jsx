import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("/api/users/login", formData);
      localStorage.setItem("token", res.data.token);
      setUser(res.data);
      navigate(location.state?.from || "/");
    } catch (err) {
      const msg =
        err.response?.data?.message ??
        err.response?.data?.error ??
        err.message;
      setError(
        msg ||
          (err.response
            ? "Login failed"
            : "Cannot reach server. Is the backend running on port 5000?")
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Log in
        </h2>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-600 text-sm font-medium mb-1">
              Email
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-200 outline-none focus:border-red-400"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-600 text-sm font-medium mb-1">
              Password
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-200 outline-none focus:border-red-400"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-500 text-white p-3 rounded-md hover:bg-red-600 font-medium cursor-pointer"
          >
            Log in
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Don't have an account?{" "}
          <Link to="/Register" className="text-red-500 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
