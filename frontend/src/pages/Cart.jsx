import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext.jsx";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useElements, useStripe } from "@stripe/react-stripe-js";

const imageUrl = (img) => (img ? `/uploads/${img}` : null);

const getAuthHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const initialAddress = {
  fullAddress: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
  saveAddress: false,
};

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

function CheckoutCardForm({ cart, address, setError, setLoading, loading, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();

  const products = useMemo(
    () => cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    [cart]
  );

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (!address.fullAddress.trim() || !address.city.trim() || !address.pincode.trim() || !address.phone.trim()) {
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
      const clientSecret = data?.clientSecret;
      if (!clientSecret) throw new Error("No client secret received");

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        setError(result.error.message || "Payment failed");
        return;
      }
      if (result.paymentIntent?.status !== "succeeded") {
        setError("Payment not completed");
        return;
      }

      const deliveryAddress = {
        fullAddress: address.fullAddress.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        pincode: address.pincode.trim(),
        phone: address.phone.trim(),
      };

      const orderRes = await axios.post(
        "/api/payment/confirm",
        { paymentIntentId: result.paymentIntent.id, products, deliveryAddress },
        { headers: getAuthHeader() }
      );

      onSuccess(orderRes.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Payment error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-4 pt-2">
      <div className="border border-gray-300 rounded-lg px-3 py-3 bg-white">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 disabled:opacity-50"
      >
        {loading ? "Processing…" : "Pay with card"}
      </button>
      <p className="text-xs text-gray-500 text-center">Test card: 4242 4242 4242 4242 · Any future date · Any CVC</p>
    </form>
  );
}

export default function Cart({ user }) {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: cart, 2: address & payment
  const [address, setAddress] = useState(initialAddress);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || step !== 2) return;
    axios.get("/api/users/me/addresses", { headers: getAuthHeader() }).then(({ data }) => setSavedAddresses(data || [])).catch(() => {});
  }, [user, step]);

  const fillFromSaved = (saved) => {
    setAddress((a) => ({
      ...a,
      fullAddress: saved.fullAddress || "",
      city: saved.city || "",
      state: saved.state || "",
      pincode: saved.pincode || "",
      phone: saved.phone || "",
    }));
  };

  const afterSuccessfulOrder = async (order) => {
    const deliveryAddress = {
      fullAddress: address.fullAddress.trim(),
      city: address.city.trim(),
      state: address.state.trim(),
      pincode: address.pincode.trim(),
      phone: address.phone.trim(),
    };
    if (address.saveAddress) {
      try {
        await axios.post("/api/users/me/addresses", { ...deliveryAddress, label: "Home" }, { headers: getAuthHeader() });
      } catch {}
    }
    clearCart();
    navigate(`/order-success?orderId=${order._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Cart</h1>

        {cartCount === 0 ? (
          <div className="bg-white rounded-xl shadow border border-gray-200 p-8 text-center">
            <p className="text-gray-500 mb-4">Your cart is empty.</p>
            <Link to="/" className="text-red-500 hover:underline font-medium">Browse menu</Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden mb-6">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-0"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {imageUrl(item.image) ? (
                      <img src={imageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🍗</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
                    <p className="text-red-600 font-medium">₹{Math.round(item.unitPrice * item.quantity)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.productId)}
                    className="text-gray-400 hover:text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-6">
              <div className="flex justify-between text-lg font-semibold text-gray-800 mb-4">
                <span>Total</span>
                <span>₹{Math.round(cartTotal)}</span>
              </div>

              {step === 1 ? (
                <>
                  {!user ? (
                    <p className="text-sm text-gray-500 text-center mb-4">You need to log in to checkout.</p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => (user ? setStep(2) : navigate("/login", { state: { from: "/cart" } }))}
                    className="w-full py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600"
                  >
                    Proceed to delivery & payment
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <h2 className="font-semibold text-gray-800">Delivery address</h2>
                  {savedAddresses.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Saved addresses — select one to reuse</p>
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                        {savedAddresses.map((saved) => (
                          <button
                            key={saved._id}
                            type="button"
                            onClick={() => fillFromSaved(saved)}
                            className="flex-shrink-0 w-56 text-left p-3 border-2 border-gray-200 rounded-xl hover:border-red-400 hover:bg-red-50/50 transition"
                          >
                            <span className="font-medium text-gray-800 block">{saved.label || "Address"}</span>
                            <span className="text-sm text-gray-600 line-clamp-2">{saved.fullAddress}, {saved.city} - {saved.pincode}</span>
                            <span className="text-xs text-gray-500 mt-1 block">Phone: {saved.phone}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full address *</label>
                    <input
                      type="text"
                      value={address.fullAddress}
                      onChange={(e) => setAddress((a) => ({ ...a, fullAddress: e.target.value }))}
                      placeholder="House no, building, street, area"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input
                        type="text"
                        value={address.city}
                        onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                        placeholder="City"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={address.state}
                        onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
                        placeholder="State"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                      <input
                        type="text"
                        value={address.pincode}
                        onChange={(e) => setAddress((a) => ({ ...a, pincode: e.target.value }))}
                        placeholder="Pincode"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input
                        type="tel"
                        value={address.phone}
                        onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))}
                        placeholder="10-digit mobile"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={address.saveAddress}
                      onChange={(e) => setAddress((a) => ({ ...a, saveAddress: e.target.checked }))}
                      className="rounded"
                    />
                    Save this address for next time
                  </label>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700"
                    >
                      Back
                    </button>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-2">Payment</h3>
                    {import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? (
                      <Elements stripe={stripePromise}>
                        <CheckoutCardForm
                          cart={cart}
                          address={address}
                          setError={setError}
                          setLoading={setLoading}
                          loading={loading}
                          onSuccess={afterSuccessfulOrder}
                        />
                      </Elements>
                    ) : (
                      <p className="text-sm text-amber-600">Stripe publishable key missing. Add `VITE_STRIPE_PUBLISHABLE_KEY` to `frontend/.env` and restart.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
