import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  CheckCircle,
  MapPin,
  Package,
  ArrowRight,
  Star,
} from "lucide-react";
import { useCart } from "../context/CartContext.jsx";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export default function OrderSuccess({ user }) {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewSent, setReviewSent] = useState(false);

  const [review, setReview] = useState({
    rating: 5,
    comment: "",
  });

  const orderIdParam = searchParams.get("orderId");

  useEffect(() => {
    const run = async () => {
      if (!orderIdParam) {
        setError("No order data.");
        setLoading(false);
        return;
      }

      if (!user) {
        setError("Please log in to view this order.");
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(
          "/api/orders/my-orders",
          {
            headers: getAuthHeader(),
          }
        );

        const found = data.find(
          (o) => o._id === orderIdParam
        );

        if (found) {
          setOrder(found);
          clearCart();
        } else {
          setError("Order not found.");
        }
      } catch {
        setError("Could not load order");
      }

      setLoading(false);
    };

    run();
  }, [orderIdParam, user]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!order || !user) return;

    try {
      await axios.post(
        "/api/reviews",
        {
          orderId: order._id,
          rating: review.rating,
          comment: review.comment,
        },
        {
          headers: getAuthHeader(),
        }
      );

      setReviewSent(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to submit review"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>

          <p className="text-gray-600 text-lg font-medium">
            Loading your order...
          </p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
        <div className="bg-white shadow-2xl rounded-3xl p-10 max-w-md w-full text-center border border-red-100">
          <div className="text-6xl mb-4">⚠️</div>

          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Something went wrong
          </h2>

          <p className="text-red-500 mb-6">{error}</p>

          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            Back to Menu
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-red-100 mb-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-8 text-white text-center">
            <CheckCircle
              className="mx-auto mb-4"
              size={75}
            />

            <h1 className="text-4xl font-extrabold mb-3">
              Order Confirmed!
            </h1>

            <p className="text-lg text-red-100">
              Your delicious food is on the way 🍔
            </p>
          </div>

          {/* Order Details */}
          {order && (
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Order Summary */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Package className="text-red-500" />

                    <h2 className="font-bold text-xl text-gray-800">
                      Order Summary
                    </h2>
                  </div>

                  <p className="text-gray-500 mb-2">
                    Total Amount
                  </p>

                  <h3 className="text-4xl font-extrabold text-red-500">
                    ₹{order.totalAmount}
                  </h3>

                  <div className="mt-5">
                    <p className="text-sm text-gray-500">
                      Order ID
                    </p>

                    <p className="text-sm font-medium text-gray-700 break-all">
                      {order._id}
                    </p>
                  </div>
                </div>

                {/* Delivery Address */}
                {order.deliveryAddress && (
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <MapPin className="text-red-500" />

                      <h2 className="font-bold text-xl text-gray-800">
                        Delivery Address
                      </h2>
                    </div>

                    <p className="text-gray-700 leading-relaxed">
                      {
                        order.deliveryAddress
                          .fullAddress
                      }
                    </p>

                    <p className="text-gray-600 mt-3">
                      {
                        order.deliveryAddress.city
                      }
                      {order.deliveryAddress.state
                        ? `, ${order.deliveryAddress.state}`
                        : ""}{" "}
                      -{" "}
                      {
                        order.deliveryAddress
                          .pincode
                      }
                    </p>

                    <p className="text-gray-600 mt-2">
                      📞{" "}
                      {
                        order.deliveryAddress.phone
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Review Section */}
        {order && user && !reviewSent && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Rate Your Experience
            </h2>

            <p className="text-gray-500 mb-8">
              Your feedback helps us improve 🍟
            </p>

            <form
              onSubmit={handleSubmitReview}
              className="space-y-8"
            >
              {/* Star Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-5">
                  Your Rating
                </label>

                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() =>
                        setReview((r) => ({
                          ...r,
                          rating: n,
                        }))
                      }
                      className="transition-transform hover:scale-125"
                    >
                      <Star
                        size={40}
                        className={`transition-all duration-200 ${
                          review.rating >= n
                            ? "text-yellow-400 fill-yellow-400 drop-shadow-md"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <p className="mt-4 text-sm font-medium text-gray-500">
                  {review.rating === 5 &&
                    "😍 Excellent food and service!"}

                  {review.rating === 4 &&
                    "😊 Very good experience!"}

                  {review.rating === 3 &&
                    "🙂 Good but can improve"}

                  {review.rating === 2 &&
                    "😕 Average experience"}

                  {review.rating === 1 &&
                    "😞 Poor experience"}
                </p>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Comment
                </label>

                <textarea
                  value={review.comment}
                  onChange={(e) =>
                    setReview((r) => ({
                      ...r,
                      comment: e.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Tell us about your experience..."
                  className="w-full border border-gray-300 rounded-2xl px-4 py-4 focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none resize-none transition"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 text-white font-bold text-lg transition-all shadow-lg"
              >
                Submit Review
              </button>
            </form>
          </div>
        )}

        {/* Success Message */}
        {reviewSent && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl p-5 text-center font-semibold shadow mb-6">
            🎉 Thanks for your review!
          </div>
        )}

        {/* Bottom Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link
            to="/"
            className="flex-1 bg-white border border-gray-200 hover:border-red-400 hover:text-red-500 text-gray-700 text-center py-4 rounded-2xl font-semibold shadow transition"
          >
            Back to Menu
          </Link>

          {user && (
            <Link
              to="/profile"
              className="flex-1 bg-red-500 hover:bg-red-600 text-white text-center py-4 rounded-2xl font-semibold shadow-lg transition"
            >
              View Orders
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}