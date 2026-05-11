import { Link } from "react-router-dom";
import {
  FacebookFilled,
  InstagramFilled,
  TwitterSquareFilled,
  YoutubeFilled,
} from "@ant-design/icons";

const Footer = () => {
  return (
    <footer className="bg-black text-white mt-10">

      {/* TOP SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">

        {/* BRAND */}
        <div>

          <h2 className="text-3xl font-black text-red-500">
            GoldenChicken
          </h2>

          <p className="text-gray-400 mt-4 text-sm leading-6">
            Delicious crispy chicken, burgers, fries, wraps,
            and combo meals delivered hot and fresh to your doorstep.
          </p>

          {/* SOCIAL ICONS */}
          <div className="flex items-center gap-4 mt-5 text-2xl">

            <a
              href="#"
              className="hover:text-red-500 transition"
            >
              <FacebookFilled />
            </a>

            <a
              href="#"
              className="hover:text-red-500 transition"
            >
              <InstagramFilled />
            </a>

            <a
              href="#"
              className="hover:text-red-500 transition"
            >
              <TwitterSquareFilled />
            </a>

            <a
              href="#"
              className="hover:text-red-500 transition"
            >
              <YoutubeFilled />
            </a>

          </div>

        </div>

        {/* QUICK LINKS */}
        <div>

          <h3 className="text-xl font-bold mb-4">
            Quick Links
          </h3>

          <div className="flex flex-col gap-3 text-gray-400">

            <Link
              to="/"
              className="hover:text-red-500 transition"
            >
              Home
            </Link>

            <Link
              to="/menu"
              className="hover:text-red-500 transition"
            >
              Menu
            </Link>

            <Link
              to="/coupons"
              className="hover:text-red-500 transition"
            >
              Coupons
            </Link>

            <Link
              to="/cart"
              className="hover:text-red-500 transition"
            >
              Cart
            </Link>

          </div>

        </div>

        {/* CONTACT */}
        <div>

          <h3 className="text-xl font-bold mb-4">
            Contact
          </h3>

          <div className="flex flex-col gap-3 text-gray-400 text-sm">

            <p>📍 Tamil Nadu, India</p>

            <p>📞 +91 98765 43210</p>

            <p>✉ support@goldenchicken.com</p>

            <p>🕒 10:00 AM - 11:00 PM</p>

          </div>

        </div>

      </div>

      {/* BOTTOM */}
      <div className="border-t border-gray-800">

        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">

          <p className="text-gray-500 text-sm">
            © 2026 GoldenChicken. All rights reserved.
          </p>

          <div className="flex items-center gap-5 text-sm text-gray-500">

            <Link
              to="/privacy"
              className="hover:text-red-500 transition"
            >
              Privacy Policy
            </Link>

            <Link
              to="/terms"
              className="hover:text-red-500 transition"
            >
              Terms & Conditions
            </Link>

          </div>

        </div>

      </div>

    </footer>
  );
};

export default Footer;