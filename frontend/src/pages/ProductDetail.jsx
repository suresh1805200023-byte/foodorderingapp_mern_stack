import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext.jsx";

const getAuthHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const ProductDetail = ({ user, refreshUser }) => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    axios
      .get(`/api/pr/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user?.favorites || !product?._id) return;
    setIsFavorite(user.favorites.some((fid) => String(fid) === String(product._id)));
  }, [user?.favorites, product?._id]);

  const imageUrl = (img) => (img ? `/uploads/${img}` : null);
  const price = Number(product?.price) || 0;
  const discount = Number(product?.discount) || 0;
  const afterDiscount = discount ? price * (1 - discount / 100) : price;

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-gray-500">Product not found. <Link to="/" className="text-red-500 ml-2">Back to menu</Link></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/" className="text-red-500 hover:underline mb-6 inline-block">← Back to menu</Link>
        <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/2 aspect-square md:aspect-auto bg-gray-100 flex items-center justify-center">
            {imageUrl(product.image) ? (
              <img src={imageUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl">🍗</span>
            )}
          </div>
          <div className="p-6 md:p-8 flex-1">
            <span className="text-sm font-semibold text-red-600 uppercase tracking-wide">{product.category || "Menu"}</span>
            <h1 className="text-3xl font-bold text-gray-800 mt-2">{product.name}</h1>
            {product.description && <p className="text-gray-600 mt-4">{product.description}</p>}
            <div className="mt-6 flex items-center gap-3">
              {discount > 0 && <span className="text-gray-400 line-through">₹{price}</span>}
              <span className="text-2xl font-bold text-gray-800">₹{Math.round(afterDiscount)}</span>
              {discount > 0 && <span className="text-red-600 font-medium">{discount}% off</span>}
            </div>
            {user && (
              <div className="mt-4">
                <button
                  type="button"
                  disabled={favoriteLoading}
                  onClick={async () => {
                    setFavoriteLoading(true);
                    try {
                      if (isFavorite) {
                        await axios.delete(`/api/users/me/favorites/${product._id}`, { headers: getAuthHeader() });
                        setIsFavorite(false);
                      } else {
                        await axios.post("/api/users/me/favorites", { productId: product._id }, { headers: getAuthHeader() });
                        setIsFavorite(true);
                      }
                      refreshUser?.();
                    } finally {
                      setFavoriteLoading(false);
                    }
                  }}
                  className="text-gray-600 hover:text-red-500 text-sm font-medium disabled:opacity-50"
                >
                  {isFavorite ? "♥ Remove from favorites" : "♡ Add to favorites"}
                </button>
              </div>
            )}
            {product.available !== false && (
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-10 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => {
                    addToCart(product, quantity);
                    setAdded(true);
                    setTimeout(() => setAdded(false), 2000);
                  }}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                >
                  {added ? "Added! View cart" : "Add to cart"}
                </button>
                {added && (
                  <Link to="/cart" className="text-red-500 hover:underline font-medium">View cart →</Link>
                )}
              </div>
            )}
            {product.available === false && <p className="mt-4 text-gray-500">Currently unavailable</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
