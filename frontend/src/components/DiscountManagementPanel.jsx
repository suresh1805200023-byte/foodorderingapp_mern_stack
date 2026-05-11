import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/**
 * Create / list / toggle / delete coupon codes (Discount model).
 * Used on Admin dashboard and on the public Coupons page for admins.
 */
const DiscountManagementPanel = ({ onInventoryChange, className }) => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percent", value: 10, minOrder: 0, expiresAt: "" });

  const fetchDiscounts = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/admin/discounts", { headers: getAuthHeader() });
      setDiscounts(data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load discounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  const notifyChange = () => {
    onInventoryChange?.();
  };

  const createDiscount = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = { ...form, value: Number(form.value), minOrder: Number(form.minOrder) || 0, expiresAt: form.expiresAt || null };
      const { data } = await axios.post("/api/admin/discounts", payload, { headers: getAuthHeader() });
      setDiscounts((prev) => [data, ...prev]);
      setForm({ code: "", type: "percent", value: 10, minOrder: 0, expiresAt: "" });
      notifyChange();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create discount");
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (d) => {
    try {
      const { data } = await axios.patch(`/api/admin/discounts/${d._id}`, { active: !d.active }, { headers: getAuthHeader() });
      setDiscounts((prev) => prev.map((x) => (x._id === data._id ? data : x)));
      notifyChange();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update");
    }
  };

  const deleteDiscount = async (id) => {
    if (!window.confirm("Delete this discount?")) return;
    try {
      await axios.delete(`/api/admin/discounts/${id}`, { headers: getAuthHeader() });
      setDiscounts((prev) => prev.filter((d) => d._id !== id));
      notifyChange();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow border border-gray-200 p-6 ${className ?? "mb-8"}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Manage coupons &amp; discounts</h2>
        <button
          type="button"
          onClick={fetchDiscounts}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm"
        >
          Refresh
        </button>
      </div>
      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

      <form onSubmit={createDiscount} className="border border-gray-200 rounded-xl p-5 mb-6 bg-gray-50">
        <h3 className="font-semibold text-gray-800 mb-4">Create discount</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            placeholder="CODE"
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
            required
          />
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="percent">percent</option>
            <option value="fixed">fixed</option>
          </select>
          <input
            type="number"
            value={form.value}
            onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
            placeholder="Value"
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
            required
          />
          <input
            type="number"
            value={form.minOrder}
            onChange={(e) => setForm((f) => ({ ...f, minOrder: e.target.value }))}
            placeholder="Min order ₹"
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
          />
          <input
            type="date"
            value={form.expiresAt}
            onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium text-sm disabled:opacity-50"
        >
          {creating ? "Creating…" : "Create"}
        </button>
      </form>

      <h3 className="font-semibold text-gray-800 mb-4">All coupons</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : discounts.length === 0 ? (
          <p className="text-gray-500">No discounts yet.</p>
        ) : (
          discounts.map((d) => (
            <div key={d._id} className="rounded-xl border border-gray-200 p-5 flex justify-between items-center bg-gray-50">
              <div>
                <p className="font-bold text-gray-800 text-lg">{d.code}</p>
                <p className="text-red-600 font-medium">
                  {d.type === "percent" ? `${d.value}%` : `₹${d.value}`} off
                </p>
                <p className="text-gray-500 text-sm">
                  Min order: ₹{d.minOrder || 0} ·{" "}
                  {d.expiresAt ? `Valid till ${new Date(d.expiresAt).toLocaleDateString()}` : "No expiry"}
                </p>
                <p className="text-xs mt-1">
                  <span className={`px-2 py-0.5 rounded ${d.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                    {d.active ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={() => toggleActive(d)} className="text-red-500 hover:underline text-sm">
                  {d.active ? "Deactivate" : "Activate"}
                </button>
                <button type="button" onClick={() => deleteDiscount(d._id)} className="text-gray-500 hover:underline text-sm">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DiscountManagementPanel;
