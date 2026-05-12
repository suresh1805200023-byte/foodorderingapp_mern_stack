import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext.jsx";

const Home = ({ user }) => {
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/pr/all")
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const imageUrl = (img) => (img ? `/uploads/${img}` : null);

  const availableProducts = products.filter(
    (p) => p.available !== false
  );

  const featured = availableProducts[0];
  const gridProducts = availableProducts.slice(1);

  const priceDisplay = (p) => {
    const price = Number(p.price) || 0;
    const discount = Number(p.discount) || 0;

    const afterDiscount = discount
      ? price * (1 - discount / 100)
      : price;

    return (
      <div className="flex items-center gap-2">
        {discount > 0 && (
          <span className="text-gray-400 text-xs line-through">
            ₹{price}
          </span>
        )}

        <span className="font-semibold text-gray-800 text-sm">
          ₹{Math.round(afterDiscount)}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* PRODUCTS SECTION */}
      <div className="max-w-6xl mx-auto px-4 py-10">

        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter">
            Our Menu
          </h2>
          <div className="h-1 flex-1 bg-gray-200 rounded-full hidden sm:block"></div>
        </div>

        {loading ? (
          <p className="text-gray-500">
            Loading deliciousness...
          </p>
        ) : availableProducts.length === 0 ? (
          <p className="text-gray-500">
            No menu items yet. Check back later.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">

            {/* FEATURED PRODUCT */}
            {featured && (
              <Link
                to={`/product/${featured._id}`}
                className="lg:col-span-1 flex flex-col rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="aspect-[4/2.8] bg-red-50 flex items-center justify-center overflow-hidden">
                  {imageUrl(featured.image) ? (
                   <img
  src={featured.image}
  alt={featured.name}
  className="w-full h-full object-cover"
  onError={(e) => {
    e.target.style.display = "none";
  }}
/>
                  ) : (
                    <span className="text-gray-400 text-4xl">🍗</span>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <span className="text-xs font-black text-red-600 uppercase tracking-widest">
                    {featured.category || "Featured"}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">
                    {featured.name}
                  </h3>
                  {featured.description && (
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2 leading-relaxed">
                      {featured.description}
                    </p>
                  )}
                  <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                    {priceDisplay(featured)}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart(featured, 1);
                      }}
                      className="p-2 bg-gray-900 text-white rounded-lg hover:bg-red-600 transition-colors"
                      aria-label="Add to cart"
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

            {/* GRID PRODUCTS */}
            {gridProducts.map((p) => (
              <Link
                key={p._id}
                to={`/product/${p._id}`}
                className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center overflow-hidden">
                  {imageUrl(p.image) ? (
                    <img
                      src={imageUrl(p.image)}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-gray-400 text-4xl">🍔</span>
                  )}
                </div>

                <div className="p-3 flex-1 flex flex-col">
                  <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">
                    {p.category || "Menu"}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 mt-1">
                    {p.name}
                  </h3>
                  <div className="mt-auto pt-3 flex items-center justify-between">
                    {priceDisplay(p)}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart(p, 1);
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;