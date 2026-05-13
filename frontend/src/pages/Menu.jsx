import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext.jsx";

/* ================= IMAGE FIX (PRODUCTION SAFE) ================= */
const imageUrl = (img) => {
  if (!img) return "";

  if (typeof img === "string" && img.startsWith("http")) {
    return img;
  }

  const baseURL = import.meta.env.VITE_API_URL || "";
  return `${baseURL}/uploads/${img}`;
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

    return { categories, byCategory: map };
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
    const el = document.getElementById(`cat-${slugify(cat)}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-black uppercase">Browse Menu</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">

        {/* SIDEBAR */}
        <aside className="hidden lg:block w-72">
          <div className="bg-white rounded-3xl p-4">
            {grouped.categories.map((cat) => (
              <button
                key={cat}
                onClick={() => scrollToCategory(cat)}
                className="w-full text-left p-3 rounded-xl hover:bg-gray-100"
              >
                {cat}
              </button>
            ))}
          </div>
        </aside>

        {/* CONTENT */}
        <main className="flex-1">

          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="space-y-12">

              {grouped.categories.map((cat) => (
                <section key={cat} id={`cat-${slugify(cat)}`}>
                  <h2 className="text-2xl font-bold mb-4">{cat}</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">

                    {(grouped.byCategory.get(cat) || []).map((p) => (
                      <div
                        key={p._id}
                        className="bg-white rounded-2xl shadow overflow-hidden"
                      >

                        <Link to={`/product/${p._id}`}>

                          {imageUrl(p.image) ? (
                            <img
                              src={imageUrl(p.image)}
                              alt={p.name}
                              className="h-64 w-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/placeholder.png";
                              }}
                            />
                          ) : (
                            <div className="h-64 flex items-center justify-center text-6xl">
                              🍗
                            </div>
                          )}

                        </Link>

                        <div className="p-4">
                          <h3 className="font-bold">{p.name}</h3>
                          <p>₹{Math.round(priceAfterDiscount(p))}</p>

                          <button
                            onClick={() => addToCart(p, 1)}
                            className="mt-3 w-full bg-black text-white py-2 rounded-lg"
                          >
                            Add
                          </button>
                        </div>

                      </div>
                    ))}

                  </div>
                </section>
              ))}

            </div>
          )}

        </main>

      </div>
    </div>
  );
}