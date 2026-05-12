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

      {/* Main */}
      <main className="flex-1 overflow-auto p-6">
        {activeSection === "dashboard" && <DashboardStats />}
        {activeSection === "products" && <ProductManagement />}
        {activeSection === "orders" && <OrderManagement />}
        {activeSection === "users" && <UserManagement />}
        {activeSection === "discounts" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Discount Management
            </h1>
            <DiscountManagementPanel />
          </div>
        )}
        {activeSection === "notifications" && <NotificationManagement />}
      </main>
    </div>
  );
};

/* ================= PRODUCT MANAGEMENT ================= */

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/products", {
        headers: getAuthHeader(),
      });
      setProducts(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Product Management</h1>

      {error && <p className="text-red-500">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Image</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Price</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-t">
                  <td className="p-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        e.target.src = "/placeholder.png";
                      }}
                    />
                  </td>

                  <td className="p-3">{p.name}</td>
                  <td className="p-3">₹{p.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ================= OTHER SECTIONS (UNCHANGED) ================= */

function DashboardStats() {
  return <div>Dashboard</div>;
}

function OrderManagement() {
  return <div>Orders</div>;
}

function UserManagement() {
  return <div>Users</div>;
}

function NotificationManagement() {
  return <div>Notifications</div>;
}

export default Admin;