import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext.jsx";
import CouponCard from "../components/CouponCard.jsx";

const Home = ({ user }) => {
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/pr/all")
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    axios
      .get("/api/coupons")
      .then((res) => setCoupons(res.data))
      .catch(() => setCoupons([]))
      .finally(() => setCouponsLoading(false));
  }, []);

  const imageUrl = (img) => {
    if (!img) return null;

    if (img.startsWith("http")) return img;

    return `/uploads/${img}`;
  };

  const availableProducts = products.filter(
    (p) => p.available !== false
  );

  const featured = availableProducts[0];
  const gridProducts = availableProducts.slice(1);

  const calculatePrice = (price, discount) => {
    const finalPrice = discount
      ? price * (1 - discount / 100)
      : price;

    return Math.round(finalPrice);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-orange-500">

        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-yellow-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-20 text-center">

          <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-white text-sm font-semibold backdrop-blur">
            Fresh • Crispy • Delicious
          </span>

          <h1 className="mt-6 text-4xl md:text-6xl font-black text-white leading-tight">
            {user
              ? `Welcome Back, ${user.name || user.email}`
              : "GoldenChicken"}
          </h1>

          <p className="mt-4 text-white/90 text-lg max-w-2xl mx-auto">
            Taste the crunchiest fried chicken and hottest deals
            delivered right to your doorstep.
          </p>

          {!user && (
            <div className="flex flex-wrap justify-center gap-4 mt-8">

              <Link
                to="/login"
                className="px-8 py-3 bg-white text-red-600 rounded-full font-bold shadow-xl hover:scale-105 transition duration-300"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="px-8 py-3 bg-black/20 backdrop-blur border border-white/30 text-white rounded-full font-bold hover:bg-black/30 transition duration-300"
              >
                Register
              </Link>

            </div>
          )}

        </div>

      </section>

      {/* PRODUCTS */}
      <section className="max-w-6xl mx-auto px-4 py-14">

        <div className="flex items-center gap-4 mb-10">

          <h2 className="text-3xl md:text-4xl font-black text-gray-900">
            Browse Menu
          </h2>

          <div className="h-1 flex-1 bg-gradient-to-r from-red-500 to-transparent rounded-full"></div>

        </div>

        {loading ? (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white rounded-3xl overflow-hidden shadow"
              >
                <div className="h-48 bg-gray-200"></div>

                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                  <div className="h-10 bg-gray-100 rounded"></div>
                </div>
              </div>
            ))}

          </div>

        ) : availableProducts.length === 0 ? (

          <div className="text-center py-20 bg-white rounded-3xl shadow-sm">

            <div className="text-7xl mb-5">🍗</div>

            <h3 className="text-2xl font-bold text-gray-800">
              No Menu Available
            </h3>

            <p className="text-gray-500 mt-2">
              New delicious items are coming soon.
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* FEATURED */}
            {featured && (
              <Link
                to={`/product/${featured._id}`}
                className="lg:col-span-2 relative group overflow-hidden rounded-3xl bg-white shadow hover:shadow-2xl transition duration-500"
              >

                <div className="overflow-hidden">

                  {imageUrl(featured.image) ? (
                    <img
                      src={imageUrl(featured.image)}
                      alt={featured.name}
                      className="h-80 w-full object-cover group-hover:scale-110 transition duration-700"
                    />
                  ) : (
                    <div className="h-80 flex items-center justify-center text-7xl bg-red-50">
                      🍗
                    </div>
                  )}

                </div>

                <div className="p-6">

                  <span className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold uppercase tracking-widest">
                    Featured
                  </span>

                  <h3 className="text-3xl font-black text-gray-900 mt-4">
                    {featured.name}
                  </h3>

                  {featured.description && (
                    <p className="text-gray-500 mt-3 leading-relaxed">
                      {featured.description}
                    </p>
                  )}

                  <div className="mt-6 flex items-center justify-between">

                    <div>
                      {featured.discount > 0 && (
                        <span className="text-gray-400 line-through text-sm mr-2">
                          ₹{featured.price}
                        </span>
                      )}

                      <span className="text-3xl font-black text-red-600">
                        ₹
                        {calculatePrice(
                          featured.price,
                          featured.discount
                        )}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart(featured, 1);
                      }}
                      className="p-2 bg-gray-900 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>

                  </div>

                </div>

              </Link>
            )}

            {/* OTHER PRODUCTS */}
            {gridProducts.map((p) => (
              <Link
                key={p._id}
                to={`/product/${p._id}`}
                className="group bg-white rounded-3xl overflow-hidden shadow hover:shadow-xl transition duration-500"
              >

                <div className="overflow-hidden">

                  {imageUrl(p.image) ? (
                    <img
                      src={imageUrl(p.image)}
                      alt={p.name}
                      className="h-52 w-full object-cover group-hover:scale-110 transition duration-700"
                    />
                  ) : (
                    <div className="h-52 flex items-center justify-center bg-gray-100 text-6xl">
                      🍔
                    </div>
                  )}

                </div>

                <div className="p-4 flex flex-col">

                  <span className="text-xs font-bold uppercase tracking-widest text-red-500">
                    {p.category || "Menu"}
                  </span>

                  <h3 className="text-lg font-bold text-gray-900 mt-2">
                    {p.name}
                  </h3>

                  <div className="mt-4 flex items-center justify-between">

                    <div>
                      {p.discount > 0 && (
                        <span className="text-gray-400 line-through text-xs mr-2">
                          ₹{p.price}
                        </span>
                      )}

                      <span className="text-xl font-black text-gray-900">
                        ₹
                        {calculatePrice(
                          p.price,
                          p.discount
                        )}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart(p, 1);
                      }}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-900 text-white hover:bg-red-600 transition"
                    >
                      +
                    </button>

                  </div>

                </div>

              </Link>
            ))}

          </div>
        )}

      </section>

      {/* COUPONS */}
      <section className="bg-slate-950 py-16">

        <div className="max-w-6xl mx-auto px-4">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">

            <div>

              <h2 className="text-3xl md:text-4xl font-black text-white">
                Exclusive Offers
              </h2>

              <p className="text-slate-400 mt-2">
                Save more with premium chicken deals
              </p>

            </div>

            <Link
              to="/coupons"
              className="px-5 py-3 border border-slate-700 text-slate-300 rounded-full font-bold hover:bg-slate-800 transition"
            >
              View All Coupons
            </Link>

          </div>

          {couponsLoading ? (
            <p className="text-slate-500">
              Loading coupons...
            </p>
          ) : coupons.length === 0 ? (
            <p className="text-slate-500 italic">
              No active coupons right now.
            </p>
          ) : (

            <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-4">

              {coupons.map((c) => (
                <div
                  key={c._id}
                  className="min-w-[280px]"
                >
                  <CouponCard coupon={c} compact />
                </div>
              ))}

            </div>

          )}

        </div>

      </section>

    </div>
  );
};

export default Home;