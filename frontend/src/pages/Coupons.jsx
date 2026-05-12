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

  // ✅ SAFE IMAGE FUNCTION
  const imageUrl = (img) => {
    if (!img) return "";

    if (typeof img === "string" && img.startsWith("http")) {
      return img;
    }

    return `/uploads/${img}`;
  };

  const availableProducts = products.filter((p) => p.available !== false);

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
      <section className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">

          <h1 className="text-4xl md:text-6xl font-black text-white">
            {user
              ? `Welcome Back, ${user.name || user.email}`
              : "GoldenChicken"}
          </h1>

        </div>
      </section>

      {/* PRODUCTS */}
      <section className="max-w-6xl mx-auto px-4 py-14">

        <h2 className="text-3xl font-black mb-10">Browse Menu</h2>

        {loading ? (
          <p>Loading...</p>
        ) : availableProducts.length === 0 ? (
          <p>No products</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* FEATURED */}
            {featured && (
              <Link
                to={`/product/${featured._id}`}
                className="lg:col-span-2 bg-white rounded-3xl overflow-hidden shadow"
              >
                {imageUrl(featured.image) ? (
                  <img
                    src={imageUrl(featured.image)}
                    alt={featured.name}
                    className="h-80 w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="h-80 flex items-center justify-center text-6xl">
                    🍗
                  </div>
                )}
              </Link>
            )}

            {/* PRODUCTS */}
            {gridProducts.map((p) => (
              <Link
                key={p._id}
                to={`/product/${p._id}`}
                className="bg-white rounded-3xl overflow-hidden shadow"
              >
                {imageUrl(p.image) ? (
                  <img
                    src={imageUrl(p.image)}
                    alt={p.name}
                    className="h-52 w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="h-52 flex items-center justify-center text-5xl">
                    🍔
                  </div>
                )}

                <div className="p-4">
                  <h3 className="font-bold">{p.name}</h3>
                  <p>₹{calculatePrice(p.price, p.discount)}</p>
                </div>
              </Link>
            ))}

          </div>
        )}
      </section>

      {/* COUPONS */}
      <section className="bg-black py-16 text-white">
        <div className="max-w-6xl mx-auto px-4">

          <h2 className="text-3xl font-black mb-6">
            Exclusive Offers
          </h2>

          {couponsLoading ? (
            <p>Loading coupons...</p>
          ) : coupons.length === 0 ? (
            <p>No coupons</p>
          ) : (
            <div className="flex gap-5 overflow-x-auto">
              {coupons.map((c) => (
                <CouponCard key={c._id} coupon={c} compact />
              ))}
            </div>
          )}

        </div>
      </section>

    </div>
  );
};

export default Home;