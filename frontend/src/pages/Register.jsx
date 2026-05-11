import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = ({ setUser }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        console.log(formData);
      const res = await axios.post("/api/users/register", formData);
      localStorage.setItem("token", res.data.token);
      console.log(res.data);
      setUser(res.data);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message ?? err.response?.data?.error ?? err.message;
      setError(msg || (err.response ? "Registration failed" : "Cannot reach server. Is the backend running on port 5000?"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Register
        </h2>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-600 text-sm font-medium mb-1">
              name
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-200 outline-none focus:border-red-400"
              type="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              autoComplete="off"
              required
            />
          </div>
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
              autoComplete="off"
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
              required
            />
          </div>
          <button className="w-full bg-red-500 text-white p-3 rounded-md hover:bg-red-600 font-medium cursor-pointer">
            Register
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-red-500 hover:underline font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
