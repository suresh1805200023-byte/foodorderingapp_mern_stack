import { Link } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Avatar } from "antd";
import { useCart } from "../context/CartContext.jsx";

import logo from "../assets/logo1.jpg"; // IMPORT LOGO

const Navbar = ({ user }) => {
  const { cartCount } = useCart();

  return (
    <nav className="w-full bg-white h-20 flex items-center justify-between px-10 border-b shadow-md">

      {/* Left Side */}
      <div className="flex items-center gap-10">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="GoldenChicken Logo"
            className="w-20 h-20 rounded-full object-cover"
          />

          <h1 className="text-3xl font-bold text-red-500 hover:text-red-600">
            GoldenChicken
          </h1>
        </Link>

        <Link to="/Menu" className="hover:text-red-500">
          Menu
        </Link>

        

        {user?.role === "admin" && (
          <Link to="/admin" className="hover:text-red-500 font-medium">
            Admin
          </Link>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6">
        {user ? (
          <Link
            className="hover:text-red-500 flex items-center gap-2"
            to="/profile"
          >
            <Avatar icon={<UserOutlined />} />
            Profile
          </Link>
        ) : (
          <Link
            className="hover:text-red-500 flex items-center gap-2"
            to="/login"
          >
            <Avatar icon={<UserOutlined />} />
            Sign in
          </Link>
        )}

        <Link
          className="hover:text-red-500 relative inline-flex items-center"
          to="/cart"
        >
          <ShoppingCartIcon fontSize="large" />

          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;