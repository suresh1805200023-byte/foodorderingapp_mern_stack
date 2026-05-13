import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  DashboardOutlined,
  ShoppingOutlined,
  UnorderedListOutlined,
  UserOutlined,
  TagOutlined,
  BellOutlined,
} from "@ant-design/icons";
import DiscountManagementPanel from "../components/DiscountManagementPanel.jsx";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const SIDEBAR_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: <DashboardOutlined /> },
  { key: "products", label: "Product Management", icon: <ShoppingOutlined /> },
  { key: "orders", label: "Order Management", icon: <UnorderedListOutlined /> },
  { key: "users", label: "User Management", icon: <UserOutlined /> },
  { key: "discounts", label: "Discount Management", icon: <TagOutlined /> },
  { key: "notifications", label: "Notifications", icon: <BellOutlined /> },
];

const Admin = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 shadow-sm flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-red-600">GoldenChicken Admin</h2>
        </div>
        <nav className="flex-1 p-2">
          {SIDEBAR_ITEMS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition ${
                activeSection === key
                  ? "bg-red-50 text-red-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="text-lg">{icon}</span>
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">
        {activeSection === "dashboard" && <DashboardStats />}
        {activeSection === "products" && <ProductManagement />}
        {activeSection === "orders" && <OrderManagement />}
        {activeSection === "users" && <UserManagement />}
        {activeSection === "discounts" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Discount Management</h1>
            <DiscountManagementPanel />
          </div>
        )}
        {activeSection === "notifications" && <NotificationManagement />}
      </main>
    </div>
  );
};

/* Dashboard – Statistics */
function DashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/api/admin/stats", { headers: getAuthHeader() });
        setStats(data);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load stats");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const statCards = stats
    ? [
        { label: "Total Revenue", value: `₹${Math.round(stats.totalRevenue || 0)}`, sub: "All-time", color: "bg-green-500" },
        { label: "Total Orders", value: String(stats.totalOrders || 0), sub: "All-time", color: "bg-blue-500" },
        { label: "Products", value: String(stats.totalProducts || 0), sub: "Menu items", color: "bg-amber-500" },
        { label: "Users", value: String(stats.totalUsers || 0), sub: "All users", color: "bg-purple-500" },
      ]
    : [];
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, sub, color }) => (
            <div key={label} className="bg-white rounded-xl shadow border border-gray-200 p-5">
              <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
              <p className="text-gray-400 text-xs mt-1">{sub}</p>
              <div className={`mt-2 h-1 w-12 rounded ${color}`} />
            </div>
          ))}
        </div>
      )}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Overview</h3>
        <p className="text-gray-500 text-sm">
          This dashboard is now connected to your backend. Next step is adding charts (daily revenue / orders).
        </p>
      </div>
    </div>
  );
}

/* Product Management */
function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    discount: "0",
    available: true,
    imageFile: null,
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/products", { headers: getAuthHeader() });
      setProducts(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAdd = () => {
    setEditingProduct(null);
    setForm({
      name: "",
      description: "",
      category: "",
      price: "",
      discount: "0",
      available: true,
      imageFile: null,
    });
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setForm({
      name: p.name || "",
      description: p.description || "",
      category: p.category || "",
      price: p.price || "",
      discount: String(p.discount ?? 0),
      available: p.available !== false,
      imageFile: null,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("price", form.price);
      formData.append("discount", form.discount);
      formData.append("available", String(form.available));
      if (form.imageFile) formData.append("image", form.imageFile);

      if (editingProduct) {
        await axios.put(`/api/products/update/${editingProduct._id}`, formData, {
          headers: { ...getAuthHeader(), "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post("/api/products/add", formData, {
          headers: { ...getAuthHeader(), "Content-Type": "multipart/form-data" },
        });
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`/api/products/delete/${id}`, { headers: getAuthHeader() });
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete");
    }
  };

  const imageUrl = (img) => (img ? `/uploads/${img}` : null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium text-sm"
        >
          Add Product
        </button>
      </div>
      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
      {loading ? (
        <p className="text-gray-500">Loading products...</p>
      ) : (
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">Image</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">Category</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">Price</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">Discount</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No products yet. Add one above.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {imageUrl(p.image) ? (
                        <img src={imageUrl(p.image)} alt="" className="w-12 h-12 object-cover rounded" />
                      ) : (
                        <span className="text-gray-400 text-xs">No image</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.category || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">₹{p.price}</td>
                    <td className="px-4 py-3 text-gray-600">{p.discount ? `${p.discount}%` : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${p.available ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                        {p.available ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => openEdit(p)} className="text-red-500 hover:underline text-sm mr-2">Edit</button>
                      <button onClick={() => handleDelete(p._id)} className="text-gray-500 hover:underline text-sm">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">{editingProduct ? "Edit Product" : "Add Product"}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="e.g. Burgers, Buckets"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input
                    required
                    type="text"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="e.g. 199"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                  <input
                    type="text"
                    value={form.discount}
                    onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm((f) => ({ ...f, imageFile: e.target.files?.[0] || null }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                {editingProduct?.image && !form.imageFile && (
                  <p className="text-xs text-gray-500 mt-1">Current: {editingProduct.image}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={form.available}
                  onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))}
                />
                <label htmlFor="available" className="text-sm text-gray-700">Available</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium">
                  {editingProduct ? "Update" : "Add"} Product
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* Order Management */
function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/admin/orders", { headers: getAuthHeader() });
      setOrders(data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, orderStatus) => {
    try {
      const { data } = await axios.patch(
        `/api/admin/orders/${orderId}/status`,
        { orderStatus },
        { headers: getAuthHeader() }
      );
      setOrders((prev) => prev.map((o) => (o._id === data._id ? data : o)));
      if (selected?._id === data._id) setSelected(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const statusPill = (status) => {
    const map = {
      placed: "bg-blue-100 text-blue-700",
      preparing: "bg-amber-100 text-amber-700",
      out_for_delivery: "bg-purple-100 text-purple-700",
      delivered: "bg-green-100 text-green-700",
      cancelled: "bg-gray-200 text-gray-600",
    };
    return map[status] || "bg-gray-200 text-gray-600";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Order Management</h1>
      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm"
        >
          Refresh
        </button>
      </div>
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Order ID</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Customer</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Amount</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading…</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No orders yet.</td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">#{o._id.slice(-6).toUpperCase()}</td>
                  <td className="px-4 py-3 text-gray-600">{o.userId?.name || "—"}<div className="text-xs text-gray-400">{o.userId?.email || ""}</div></td>
                  <td className="px-4 py-3 text-gray-600">₹{o.totalAmount}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${statusPill(o.orderStatus)}`}>
                        {String(o.orderStatus || "placed").replaceAll("_", " ")}
                      </span>
                      <select
                        value={o.orderStatus || "placed"}
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="placed">placed</option>
                        <option value="preparing">preparing</option>
                        <option value="out_for_delivery">out for delivery</option>
                        <option value="delivered">delivered</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{new Date(o.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(o)} className="text-red-500 hover:underline text-sm">View</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Order #{selected._id.slice(-6).toUpperCase()}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-800">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Customer</p>
                  <p className="font-medium text-gray-800">{selected.userId?.name || "—"}</p>
                  <p className="text-sm text-gray-600">{selected.userId?.email || ""}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Total</p>
                  <p className="font-bold text-gray-800">₹{selected.totalAmount}</p>
                  <p className="text-sm text-gray-600">Status: {String(selected.orderStatus || "placed").replaceAll("_", " ")}</p>
                </div>
              </div>

              {selected.deliveryAddress && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Delivery address</p>
                  <p className="text-gray-800">{selected.deliveryAddress.fullAddress}</p>
                  <p className="text-gray-600">{selected.deliveryAddress.city}{selected.deliveryAddress.state ? `, ${selected.deliveryAddress.state}` : ""} - {selected.deliveryAddress.pincode}</p>
                  <p className="text-gray-600">Phone: {selected.deliveryAddress.phone}</p>
                </div>
              )}

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 font-medium text-gray-800">Items</div>
                <div className="divide-y divide-gray-200">
                  {(selected.products || []).map((it, idx) => (
                    <div key={idx} className="px-4 py-3 flex items-center justify-between">
                      <div className="text-gray-800">{it.productId?.name || "Product"} <span className="text-gray-400">× {it.quantity}</span></div>
                      <Link to={it.productId?._id ? `/product/${it.productId._id}` : "#"} className="text-sm text-red-500 hover:underline">View</Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* User Management */
function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/admin/users", { headers: getAuthHeader() });
      setUsers(data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const setBan = async (id, isBanned) => {
    try {
      const reason = isBanned ? window.prompt("Ban reason (optional):", "") : "";
      const { data } = await axios.patch(
        `/api/admin/users/${id}/ban`,
        { isBanned, reason },
        { headers: getAuthHeader() }
      );
      setUsers((prev) => prev.map((u) => (u._id === data._id ? data : u)));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update ban status");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">User Management</h1>
      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Role</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Joined</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading…</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No users.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs ${u.role === "admin" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>
                        {u.role}
                      </span>
                      {u.isBanned && (
                        <span className="px-2 py-0.5 rounded text-xs bg-gray-900 text-white">
                          Banned
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {u.role !== "admin" && (
                        <button
                          onClick={() => setBan(u._id, !u.isBanned)}
                          className={`text-sm font-medium hover:underline ${u.isBanned ? "text-green-600" : "text-red-500"}`}
                        >
                          {u.isBanned ? "Unban" : "Ban"}
                        </button>
                      )}
                      <button onClick={fetchUsers} className="text-gray-500 hover:underline text-sm">Refresh</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* Notifications */
function NotificationManagement() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", message: "", level: "info" });
  const [creating, setCreating] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/admin/notifications", { headers: getAuthHeader() });
      setNotifications(data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await axios.post("/api/admin/notifications/mark-all-read", {}, { headers: getAuthHeader() });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      setError(err.response?.data?.message || "Failed");
    }
  };

  const createNotification = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await axios.post("/api/admin/notifications", form, { headers: getAuthHeader() });
      setNotifications((prev) => [data, ...prev]);
      setForm({ title: "", message: "", level: "info" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create notification");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        <div className="flex gap-2">
          <button onClick={fetchNotifications} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm">
            Refresh
          </button>
          <button onClick={markAllRead} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm">
            Mark all as read
          </button>
        </div>
      </div>
      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

      <form onSubmit={createNotification} className="bg-white rounded-xl shadow border border-gray-200 p-5 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Create notification</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Title" className="border border-gray-300 rounded-lg px-3 py-2 md:col-span-2" required />
          <select value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-2">
            <option value="info">info</option>
            <option value="success">success</option>
            <option value="warning">warning</option>
            <option value="error">error</option>
          </select>
          <button type="submit" disabled={creating} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium text-sm disabled:opacity-50">
            {creating ? "Creating…" : "Create"}
          </button>
        </div>
        <textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="Message (optional)" className="mt-3 w-full border border-gray-300 rounded-lg px-3 py-2" rows={2} />
      </form>

      <div className="bg-white rounded-xl shadow border border-gray-200 divide-y divide-gray-200">
        {loading ? (
          <div className="px-5 py-6 text-gray-500">Loading…</div>
        ) : notifications.length === 0 ? (
          <div className="px-5 py-6 text-gray-500">No notifications.</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`px-5 py-4 flex justify-between items-center ${!n.read ? "bg-red-50/50" : ""}`}
            >
              <div>
                <p className="font-medium text-gray-800">{n.title}</p>
                {n.message && <p className="text-gray-600 text-sm">{n.message}</p>}
                <p className="text-gray-500 text-xs mt-1">{new Date(n.createdAt).toLocaleString()} · {n.level}</p>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full bg-red-500" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Admin;
