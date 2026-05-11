import { useState, useEffect, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import axios from "axios";

import { CartProvider } from "./context/CartContext.jsx";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import Admin from "./pages/Admin.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import OrderSuccess from "./pages/OrderSuccess.jsx";
import Home from "./pages/Home.jsx";
import Menu from "./pages/Menu.jsx";
import Coupons from "./pages/Coupons.jsx";

import Notfound from "./components/Notfound.jsx";

const App = () => {

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    return token ? { token } : null;
  });

  const refreshUser = useCallback(async () => {

    const token = localStorage.getItem("token");

    if (!token) return;

    try {

      const { data } = await axios.get(
        "/api/users/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser({
        ...data,
        token,
      });

    } catch {

      localStorage.removeItem("token");
      setUser(null);

    }

  }, []);

  useEffect(() => {

    if (!user?.token || user.role) return;

    refreshUser();

  }, [user?.token]);

  return (

    <CartProvider>

      <Router>

        {/* NAVBAR */}
        <Navbar user={user} />

        {/* ROUTES */}
        <Routes>

          <Route
            path="/Register"
            element={
              <Register setUser={setUser} />
            }
          />

          <Route
            path="/login"
            element={
              <Login setUser={setUser} />
            }
          />

          <Route
            path="/"
            element={
              <Home
                user={user}
                refreshUser={refreshUser}
              />
            }
          />

          <Route
            path="/Menu"
            element={<Menu />}
          />

          <Route
            path="/coupons"
            element={
              <Coupons user={user} />
            }
          />

          <Route
            path="/product/:id"
            element={
              <ProductDetail
                user={user}
                refreshUser={refreshUser}
              />
            }
          />

          <Route
            path="/cart"
            element={
              <Cart user={user} />
            }
          />

          <Route
            path="/order-success"
            element={
              <OrderSuccess user={user} />
            }
          />

          <Route
            path="/profile"
            element={
              <Profile
                user={user}
                setUser={setUser}
              />
            }
          />

          <Route
            path="/admin"
            element={
              user?.role === "admin" ? (
                <Admin />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="*"
            element={<Notfound />}
          />

        </Routes>

        {/* FOOTER */}
        <Footer />

      </Router>

    </CartProvider>

  );
};

export default App;