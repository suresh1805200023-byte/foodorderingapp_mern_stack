import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext.jsx";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const imageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return `/uploads/${img}`;
};

const ProductDetail = ({ user, refreshUser }) => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // ================= FETCH PRODUCT =================
  useEffect(() => {
    if (!id) return;

    setLoading(true);

    axios
      .get(`/api/pr/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  // ================= SYNC FAVORITES =================
  useEffect(() => {
    if (!user || !product) return;

    const favs = user.favorites || [];
    setIsFavorite(favs.some((f) => String(f) === String(product._id)));
  }, [user, product]);

  // ================= PRICE =================
  const priceData = useMemo(() => {
    const price = Number(product?.price) || 0;
    const discount = Number(product?.discount) || 0;

    const finalPrice = discount
      ? price * (1 - discount / 100)
      : price;

    return {
      price,
      discount,
      finalPrice: Math.round(finalPrice),
    };
  }, [product]);

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  // ================= NOT FOUND =================
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Product not found.
        <Link to="/" className="text-red-500 ml-2">
          Back to menu
        </Link>
      </div>
    );
  }

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">

        {/* BACK */}
        <Link to="/" className="text-red-500 hover:underline mb-6 inline-block">
          ← Back to menu
        </Link>

        <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden flex flex-col md:flex-row">

          {/* IMAGE */}
          <div className="md:w-1/2 bg-gray-100 flex items-center justify-center">
            {imageUrl(product.image) ? (
              <img
                src={imageUrl(product.image)}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-6xl">🍗</div>
            )}
          </div>

          {/* DETAILS */}
          <div className="p-6 md:p-8 flex-1">

            <span className="text-sm font-semibold text-red-600 uppercase tracking-wide">
              {product.category || "Menu"}
            </span>

            <h1 className="text-3xl font-bold text-gray-800 mt-2">
              {product.name}
            </h1>

            {product.description && (
              <p className="text-gray-600 mt-4">
                {product.description}
              </p>
            )}

            {/* PRICE */}
            <div className="mt-6 flex items-center gap-3">
              {priceData.discount > 0 && (
                <span className="text-gray-400 line-through">
                  ₹{priceData.price}
                </span>
              )}

              <span className="text-2xl font-bold text-gray-800">
                ₹{priceData.finalPrice}
              </span>

              {priceData.discount > 0 && (
                <span className="text-red-600 font-medium">
                  {priceData.discount}% off
                </span>
              )}
            </div>

            {/* FAVORITE */}
            {user && (
              <div className="mt-4">
                <button
                  type="button"
                  disabled={favoriteLoading}
                  onClick={async () => {
                    setFavoriteLoading(true);
                    try {
                      if (isFavorite) {
                        await axios.delete(
                          `/api/users/me/favorites/${product._id}`,
                          { headers: getAuthHeader() }
                        );
                        setIsFavorite(false);
                      } else {
                        await axios.post(
                          "/api/users/me/favorites",
                          { productId: product._id },
                          { headers: getAuthHeader() }
                        );
                        setIsFavorite(true);
                      }

                      refreshUser?.();
                    } finally {
                      setFavoriteLoading(false);
                    }
                  }}
                  className="text-sm font-medium text-gray-600 hover:text-red-500 disabled:opacity-50"
                >
                  {isFavorite ? "♥ Remove from favorites" : "♡ Add to favorites"}
                </button>
              </div>
            )}

            {/* ADD TO CART */}
            {product.available !== false ? (
              <div className="mt-6 flex items-center gap-4">

                {/* QTY */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.max(1, q - 1))
                    }
                    className="w-10 h-10 border rounded-full"
                  >
                    −
                  </button>

                  <span className="w-10 text-center">
                    {quantity}
                  </span>

                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-10 border rounded-full"
                  >
                    +
                  </button>
                </div>

                {/* ADD BUTTON */}
                <button
                  onClick={() => {
                    addToCart(product, quantity);
                    setAdded(true);
                    setTimeout(() => setAdded(false), 2000);
                  }}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  {added ? "Added!" : "Add to cart"}
                </button>

                {added && (
                  <Link
                    to="/cart"
                    className="text-red-500 hover:underline"
                  >
                    View cart →
                  </Link>
                )}

              </div>
            ) : (
              <p className="mt-4 text-gray-500">
                Currently unavailable
              </p>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;