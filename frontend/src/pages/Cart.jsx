import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext.jsx";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const initialAddress = {
  fullAddress: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
  saveAddress: false,
};

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
);

/* ================= IMAGE FIX (PRODUCTION SAFE) ================= */
const imageUrl = (img) => {
  if (!img) return null;

  // already full URL (Cloudinary / Render / external)
  if (img.startsWith("http")) return img;

  // backend base URL (IMPORTANT FOR RENDER)
  const baseURL = import.meta.env.VITE_API_URL || "";

  return `${baseURL}/uploads/${img}`;
};

/* ================= PAYMENT FORM ================= */
function CheckoutCardForm({
  cart,
  address,
  setError,
  setLoading,
  loading,
  onSuccess,
}) {
  const stripe = useStripe();
  const elements = useElements();

  const products = useMemo(
    () => cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    [cart]
  );

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    if (
      !address.fullAddress.trim() ||
      !address.city.trim() ||
      !address.pincode.trim() ||
      !address.phone.trim()
    ) {
      setError("Please fill full address, city, pincode and phone.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post(
        "/api/payment/create-payment-intent",
        { products },
        { headers: getAuthHeader() }
      );

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      if (result.paymentIntent?.status !== "succeeded") {
        setError("Payment not completed");
        return;
      }

      const orderRes = await axios.post(
        "/api/payment/confirm",
        {
          paymentIntentId: result.paymentIntent.id,
          products,
          deliveryAddress: {
            fullAddress: address.fullAddress,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            phone: address.phone,
          },
        },
        { headers: getAuthHeader() }
      );

      onSuccess(orderRes.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <div className="border p-3 rounded bg-white">
        <CardElement />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-red-500 text-white py-3 rounded"
      >
        {loading ? "Processing..." : "Pay"}
      </button>
    </form>
  );
}

/* ================= CART PAGE ================= */
export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal, cartCount } =
    useCart();

  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [address, setAddress] = useState(initialAddress);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const afterSuccess = (order) => {
    clearCart();
    navigate(`/order-success?orderId=${order._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-2xl font-bold mb-6">Cart</h1>

        {cartCount === 0 ? (
          <p className="text-gray-500">Cart is empty</p>
        ) : (
          <>
            {/* CART ITEMS */}
            <div className="bg-white rounded shadow mb-6">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center p-4 border-b"
                >
                  {/* IMAGE FIX */}
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                    {imageUrl(item.image) ? (
                      <img
                        src={imageUrl(item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder.png";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        🍗
                      </div>
                    )}
                  </div>

                  <div className="flex-1 ml-3">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-red-500">₹{item.unitPrice}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.productId, -1)}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, 1)}>
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-red-500 ml-4"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* TOTAL */}
            <div className="bg-white p-4 rounded shadow mb-6">
              <p className="text-lg font-bold">Total: ₹{cartTotal}</p>
            </div>

            {/* PAYMENT STEP */}
            {step === 2 && (
              <div className="bg-white p-4 rounded shadow">
                <h2 className="font-bold mb-3">Payment</h2>

                <Elements stripe={stripePromise}>
                  <CheckoutCardForm
                    cart={cart}
                    address={address}
                    setError={setError}
                    setLoading={setLoading}
                    loading={loading}
                    onSuccess={afterSuccess}
                  />
                </Elements>

                {error && <p className="text-red-500 mt-2">{error}</p>}
              </div>
            )}

            {/* BUTTON */}
            {step === 1 && (
              <button
                onClick={() => setStep(2)}
                className="w-full bg-red-500 text-white py-3 rounded"
              >
                Proceed to Pay
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}