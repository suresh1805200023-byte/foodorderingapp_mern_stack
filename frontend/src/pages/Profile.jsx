import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const getAuthHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const imageUrl = (img) => (img ? `/uploads/${img}` : null);

const Profile = ({ user, setUser }) => {
  const [section, setSection] = useState("order-history");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressForm, setAddressForm] = useState({ fullAddress: "", city: "", state: "", pincode: "", phone: "", label: "Home" });
  const [addressSubmitting, setAddressSubmitting] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const displayName = user?.name || user?.email || "User";

  // Data Fetching Effects
  useEffect(() => {
    if (!user) return;
    if (section === "order-history") {
      setOrdersLoading(true);
      axios.get("/api/orders/my-orders", { headers: getAuthHeader() }).then(({ data }) => setOrders(data || [])).catch(() => setOrders([])).finally(() => setOrdersLoading(false));
    }
    if (section === "favorites") {
      setFavoritesLoading(true);
      axios.get("/api/users/me/favorites", { headers: getAuthHeader() }).then(({ data }) => setFavorites(data || [])).catch(() => setFavorites([])).finally(() => setFavoritesLoading(false));
    }
    if (section === "addresses") {
      setAddressesLoading(true);
      axios.get("/api/users/me/addresses", { headers: getAuthHeader() }).then(({ data }) => setAddresses(data || [])).catch(() => setAddresses([])).finally(() => setAddressesLoading(false));
    }
  }, [user, section]);

  const removeFavorite = async (productId) => {
    try {
      await axios.delete(`/api/users/me/favorites/${productId}`, { headers: getAuthHeader() });
      setFavorites((prev) => prev.filter((p) => p._id !== productId));
    } catch {}
  };

  const addAddress = async (e) => {
    e.preventDefault();
    setAddressSubmitting(true);
    try {
      const { data } = await axios.post("/api/users/me/addresses", addressForm, { headers: getAuthHeader() });
      setAddresses(data || []);
      setAddressForm({ fullAddress: "", city: "", state: "", pincode: "", phone: "", label: "Home" });
    } catch (err) {
      console.error(err);
    } finally {
      setAddressSubmitting(false);
    }
  };

  const deleteAddress = async (id) => {
    try {
      const { data } = await axios.delete(`/api/users/me/addresses/${id}`, { headers: getAuthHeader() });
      setAddresses(data || []);
    } catch {}
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: "", text: "" });
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    setPasswordSubmitting(true);
    try {
      await axios.post("/api/users/me/change-password", { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }, { headers: getAuthHeader() });
      setPasswordMessage({ type: "success", text: "Password updated successfully." });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordMessage({ type: "error", text: err.response?.data?.message || "Failed to update password." });
    } finally {
      setPasswordSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-slate-100">
          <div className="text-4xl mb-4">🔐</div>
          <p className="text-slate-600 mb-4 font-medium"> Sign in to continue </p>
          <Link to="/login" className="inline-block bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { key: "order-history", label: "Order History", icon: "📦" },
    { key: "favorites", label: "Favorites", icon: "❤️" },
    { key: "addresses", label: "Saved Addresses", icon: "📍" },
    { key: "settings", label: "Account Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white py-3 px-4 flex items-center justify-center gap-6 sticky top-0 z-50 shadow-md">
        <span className="text-sm md:text-base font-medium opacity-90">Ready for your next meal?</span>
        <Link to="/" className="bg-red-600 hover:bg-red-500 text-white text-sm font-bold px-6 py-2 rounded-full transition-transform active:scale-95 shadow-lg shadow-red-900/20">
          Start Order
        </Link>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row min-h-screen p-4 md:p-8 gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-72 shrink-0">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 sticky top-24">
            <div className="mb-8">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center text-xl font-bold mb-4">
                {displayName[0].toUpperCase()}
              </div>
              <h1 className="text-xl font-bold text-slate-800 leading-tight">
                {greeting()},<br />
                <span className="text-red-600">{displayName.split(" ")[0]}!</span>
              </h1>
            </div>
            
            <nav className="space-y-1">
              {navItems.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setSection(key)}
                  className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl font-semibold transition-all ${
                    section === key 
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <span className="text-lg">{icon}</span>
                  {label}
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
              >
                <span>🚪</span> Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1">
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200 min-h-full">
            
            {/* Order History */}
            {section === "order-history" && (
              <div className="animate-in fade-in duration-500">
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Order History</h2>
                    <p className="text-slate-500 font-medium">Manage and reorder your past favorites.</p>
                  </div>
                </div>

                {ordersLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />)}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">No orders found yet. Time for lunch?</p>
                    <Link to="/" className="text-red-600 font-bold hover:underline mt-2 inline-block">Browse Menu</Link>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {orders.map((order) => (
                      <div key={order._id} className="group border border-slate-100 bg-slate-50/50 rounded-2xl p-5 hover:border-red-200 hover:bg-white hover:shadow-xl transition-all">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <span className="inline-block px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                              Order #{order._id.slice(-6)}
                            </span>
                            <p className="text-lg font-bold text-slate-800">₹{order.totalAmount}</p>
                            <p className="text-sm text-slate-500 mt-1">Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                          <Link to={`/order-success?orderId=${order._id}`} className="bg-white px-4 py-2 rounded-lg text-sm font-bold border border-slate-200 hover:border-red-500 hover:text-red-600 transition-colors shadow-sm">
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Favorites */}
            {section === "favorites" && (
              <div className="animate-in fade-in duration-500">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">My Favorites</h2>
                <p className="text-slate-500 font-medium mb-8">Quickly add these back to your cart.</p>
                
                {favoritesLoading ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="aspect-square bg-slate-100 rounded-2xl animate-pulse" />)}
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="text-center py-20 bg-slate-50 rounded-3xl">
                    <p className="text-slate-400 font-medium">Your wishlist is empty.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((product) => (
                      <div key={product._id} className="group bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all">
                        <div className="aspect-square bg-slate-100 relative overflow-hidden">
                          {product.image ? (
                            <img src={imageUrl(product.image)} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">🍗</div>
                          )}
                          <button 
                            onClick={() => removeFavorite(product._id)}
                            className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-slate-800 line-clamp-1 group-hover:text-red-600 transition-colors">{product.name}</h3>
                          <p className="text-red-600 font-black mt-1">₹{product.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses */}
            {section === "addresses" && (
              <div className="animate-in fade-in duration-500">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-8">Saved Addresses</h2>
                
                <div className="grid gap-4 mb-10">
                  {addresses.map((addr) => (
                    <div key={addr._id} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
                      <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">📍</div>
                        <div>
                          <p className="font-bold text-slate-800">{addr.label}</p>
                          <p className="text-sm text-slate-500">{addr.fullAddress}, {addr.city}</p>
                        </div>
                      </div>
                      <button onClick={() => deleteAddress(addr._id)} className="text-slate-400 hover:text-red-600 font-bold text-sm px-3 py-1">Delete</button>
                    </div>
                  ))}
                </div>

                <form onSubmit={addAddress} className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Add New Location</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Full Address" className="md:col-span-2 w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none transition-all" value={addressForm.fullAddress} onChange={(e) => setAddressForm({ ...addressForm, fullAddress: e.target.value })} required />
                    <input type="text" placeholder="City" className="p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} required />
                    <input type="text" placeholder="Pincode" className="p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none" value={addressForm.pincode} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })} required />
                    <input type="tel" placeholder="Phone" className="p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none" value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} required />
                    <input type="text" placeholder="Label (Home/Work)" className="p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none" value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} />
                  </div>
                  <button type="submit" disabled={addressSubmitting} className="mt-6 w-full md:w-auto px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-50 shadow-lg shadow-slate-200">
                    {addressSubmitting ? "Saving..." : "Save Address"}
                  </button>
                </form>
              </div>
            )}

            {/* Account Settings */}
            {section === "settings" && (
              <div className="animate-in fade-in duration-500 max-w-xl">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-8">Account Settings</h2>
                
                <div className="grid gap-6 mb-12">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Full Name</label>
                    <p className="text-lg font-bold text-slate-800">{user.name || "Not set"}</p>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Email Address</label>
                    <p className="text-lg font-bold text-slate-800">{user.email}</p>
                  </div>
                </div>

                <form onSubmit={changePassword} className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-800 mb-6">Security & Password</h3>
                  <input type="password" placeholder="Current Password" required className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
                  <input type="password" placeholder="New Password" required minLength={6} className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                  <input type="password" placeholder="Confirm New Password" required minLength={6} className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
                  
                  {passwordMessage.text && (
                    <div className={`p-4 rounded-xl text-sm font-bold ${passwordMessage.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                      {passwordMessage.text}
                    </div>
                  )}

                  <button type="submit" disabled={passwordSubmitting} className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 shadow-xl shadow-red-100 transition-all active:scale-95 disabled:opacity-50">
                    {passwordSubmitting ? "Updating..." : "Update Security Settings"}
                  </button>
                </form>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;