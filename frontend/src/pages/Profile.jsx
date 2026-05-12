import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const imageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return `/uploads/${img}`;
};

const Profile = ({ user, setUser }) => {
  const [section, setSection] = useState("order-history");

  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [addresses, setAddresses] = useState([]);

  const [loading, setLoading] = useState(false);

  const [addressForm, setAddressForm] = useState({
    fullAddress: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    label: "Home",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const displayName = user?.name || user?.email || "User";

  // LOAD DATA
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        if (section === "order-history") {
          const { data } = await axios.get("/api/orders/my-orders", {
            headers: getAuthHeader(),
          });
          setOrders(data || []);
        }

        if (section === "favorites") {
          const { data } = await axios.get("/api/users/me/favorites", {
            headers: getAuthHeader(),
          });
          setFavorites(data || []);
        }

        if (section === "addresses") {
          const { data } = await axios.get("/api/users/me/addresses", {
            headers: getAuthHeader(),
          });
          setAddresses(data || []);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [section, user]);

  // FAVORITES REMOVE
  const removeFavorite = async (id) => {
    try {
      await axios.delete(`/api/users/me/favorites/${id}`, {
        headers: getAuthHeader(),
      });
      setFavorites((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  // ADD ADDRESS
  const addAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "/api/users/me/addresses",
        addressForm,
        { headers: getAuthHeader() }
      );
      setAddresses(data || []);
      setAddressForm({
        fullAddress: "",
        city: "",
        state: "",
        pincode: "",
        phone: "",
        label: "Home",
      });
    } catch (err) {
      console.log(err);
    }
  };

  // DELETE ADDRESS
  const deleteAddress = async (id) => {
    try {
      const { data } = await axios.delete(
        `/api/users/me/addresses/${id}`,
        { headers: getAuthHeader() }
      );
      setAddresses(data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // CHANGE PASSWORD
  const changePassword = async (e) => {
    e.preventDefault();
    setMessage("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      await axios.post(
        "/api/users/me/change-password",
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        { headers: getAuthHeader() }
      );

      setMessage("Password updated successfully");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update password");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Link to="/login" className="text-red-500 font-bold">
          Login to continue
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hi {displayName}</h1>
        <button
          onClick={handleLogout}
          className="text-red-500 font-bold"
        >
          Logout
        </button>
      </div>

      {/* NAV */}
      <div className="flex gap-4 mb-6">
        {["order-history", "favorites", "addresses", "settings"].map(
          (s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`px-4 py-2 rounded ${
                section === s
                  ? "bg-red-500 text-white"
                  : "bg-white border"
              }`}
            >
              {s}
            </button>
          )
        )}
      </div>

      {/* ORDERS */}
      {section === "order-history" && (
        <div>
          {loading ? (
            <p>Loading...</p>
          ) : orders.length === 0 ? (
            <p>No orders</p>
          ) : (
            orders.map((o) => (
              <div key={o._id} className="bg-white p-4 mb-3 rounded">
                Order #{o._id.slice(-6)} - ₹{o.totalAmount}
              </div>
            ))
          )}
        </div>
      )}

      {/* FAVORITES */}
      {section === "favorites" && (
        <div className="grid grid-cols-2 gap-4">
          {favorites.map((p) => (
            <div key={p._id} className="bg-white p-4 rounded">
              {imageUrl(p.image) && (
                <img
                  src={imageUrl(p.image)}
                  className="w-full h-40 object-cover"
                />
              )}
              <h3>{p.name}</h3>
              <button
                onClick={() => removeFavorite(p._id)}
                className="text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ADDRESSES */}
      {section === "addresses" && (
        <div>
          {addresses.map((a) => (
            <div key={a._id} className="bg-white p-3 mb-2">
              {a.fullAddress}
              <button
                onClick={() => deleteAddress(a._id)}
                className="text-red-500 ml-2"
              >
                Delete
              </button>
            </div>
          ))}

          <form onSubmit={addAddress} className="mt-4 space-y-2">
            <input
              placeholder="Address"
              value={addressForm.fullAddress}
              onChange={(e) =>
                setAddressForm({
                  ...addressForm,
                  fullAddress: e.target.value,
                })
              }
              className="border p-2 w-full"
            />
            <button className="bg-black text-white px-4 py-2">
              Save
            </button>
          </form>
        </div>
      )}

      {/* SETTINGS */}
      {section === "settings" && (
        <form onSubmit={changePassword} className="space-y-2">
          <input
            type="password"
            placeholder="Current password"
            value={passwordForm.currentPassword}
            onChange={(e) =>
              setPasswordForm({
                ...passwordForm,
                currentPassword: e.target.value,
              })
            }
            className="border p-2 w-full"
          />

          <input
            type="password"
            placeholder="New password"
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm({
                ...passwordForm,
                newPassword: e.target.value,
              })
            }
            className="border p-2 w-full"
          />

          <input
            type="password"
            placeholder="Confirm password"
            value={passwordForm.confirmPassword}
            onChange={(e) =>
              setPasswordForm({
                ...passwordForm,
                confirmPassword: e.target.value,
              })
            }
            className="border p-2 w-full"
          />

          {message && <p>{message}</p>}

          <button className="bg-red-500 text-white px-4 py-2">
            Update Password
          </button>
        </form>
      )}
    </div>
  );
};

export default Profile;