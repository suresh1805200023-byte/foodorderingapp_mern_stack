import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext.jsx";

const imageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return `/uploads/${img}`;
};

const slugify = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function Menu() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    axios
      .get("/api/pr/all")
      .then((res) => setProducts(res.data || []))
      .catch(() => {
        setProducts([]);
        setError("Failed to load menu");
      })
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const available = (products || []).filter(
      (p) => p?.available !== false
    );

    const map = new Map();

    for (const p of available) {
      const cat = (p.category || "Other").trim() || "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(p);
    }

    const categories = Array.from(map.keys()).sort((a, b) =>
      a.localeCompare(b)
    );

    return {
      categories,
      byCategory: map,
    };
  }, [products]);

  useEffect(() => {
    if (!activeCategory && grouped.categories.length > 0) {
      setActiveCategory(grouped.categories[0]);
    }
  }, [grouped.categories, activeCategory]);

  const priceAfterDiscount = (p) => {
    const price = Number(p?.price) || 0;
    const discount = Number(p?.discount) || 0;
    return discount ? price * (1 - discount / 100) : price;
  };

  const scrollToCategory = (cat) => {
    setActiveCategory(cat);
    const id = `cat-${slugify(cat)}`;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-black uppercase">
            Browse Menu
          </h1>
          <p className="mt-3 text-white/90 text-lg">
            Fresh crispy meals prepared for you
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* SIDEBAR */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-xl font-black text-gray-900 uppercase">
                  Categories
                </h2>
                <p className="text-sm text-gray-500 mt-1">Explore our menu</p>
              </div>
              <div className="p-3 max-h-[calc(100vh-140px)] overflow-y-auto">
                {grouped.categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => scrollToCategory(cat)}
                    className={`w-full text-left px-4 py-3 rounded-2xl mb-2 font-semibold transition-all ${
                      activeCategory === cat
                        ? "bg-red-50 text-red-600 border border-red-100"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* CONTENT */}
          <main className="flex-1">
            {/* MOBILE CATEGORY SELECT */}
            <div className="lg:hidden mb-6">
              <select
                value={activeCategory}
                onChange={(e) => scrollToCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-2xl px-4 py-3 bg-white shadow-sm"
              >
                {grouped.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-3xl overflow-hidden shadow animate-pulse"
                  >
                    <div className="h-56 bg-gray-200"></div>
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                      <div className="h-10 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-5">
                {error}
              </div>
            ) : grouped.categories.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
                <div className="text-7xl mb-5">🍗</div>
                <h3 className="text-2xl font-bold text-gray-800">
                  No Menu Available
                </h3>
                <p className="text-gray-500 mt-2">
                  Delicious meals coming soon.
                </p>
              </div>
            ) : (
              <div className="space-y-14">
                {grouped.categories.map((cat) => {
                  const items = grouped.byCategory.get(cat) || [];
                  return (
                    <section
                      key={cat}
                      id={`cat-${slugify(cat)}`}
                      className="scroll-mt-24"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-3xl font-black text-gray-900 uppercase">
                            {cat}
                          </h2>
                          <div className="w-20 h-1 bg-red-500 rounded-full mt-2"></div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            window.scrollTo({ top: 0, behavior: "smooth" })
                          }
                          className="text-sm text-gray-500 hover:text-red-500 font-medium"
                        >
                          Back to top
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {items.map((p) => {
                          const price = Number(p?.price) || 0;
                          const discount = Number(p?.discount) || 0;
                          const after = priceAfterDiscount(p);

                          return (
                            <div
                              key={p._id}
                              className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition duration-500 border border-gray-100"
                            >
                              <Link
                                to={`/product/${p._id}`}
                                className="block overflow-hidden"
                              >
                                {imageUrl(p.image) ? (
                                  <img
                                    src={imageUrl(p.image)}
                                    alt={p.name}
                                    className="w-full h-64 object-cover group-hover:scale-110 transition duration-700"
                                  />
                                ) : (
                                  <div className="w-full h-64 flex items-center justify-center bg-gray-100 text-7xl">
                                    🍗
                                  </div>
                                )}
                              </Link>

                              <div className="p-5">
                                <p className="text-xs font-black text-red-600 uppercase tracking-widest">
                                  {p.category || "Menu"}
                                </p>
                                <Link to={`/product/${p._id}`}>
                                  <h3 className="text-xl font-bold text-gray-900 mt-2 line-clamp-1">
                                    {p.name}
                                  </h3>
                                </Link>

                                {p.description && (
                                  <p className="text-gray-500 text-sm mt-2 line-clamp-2 leading-relaxed">
                                    {p.description}
                                  </p>
                                )}

                                <div className="mt-5 flex items-center justify-between">
                                  <div>
                                    {discount > 0 && (
                                      <span className="text-gray-400 text-sm line-through mr-2">
                                        ₹{price}
                                      </span>
                                    )}
                                    <span className="text-2xl font-black text-gray-900">
                                      ₹{Math.round(after)}
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => addToCart(p, 1)}
                                    className="w-11 h-11 rounded-2xl bg-gray-900 text-white hover:bg-red-600 transition flex items-center justify-center text-xl font-bold active:scale-95"
                                    aria-label="Add to cart"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}