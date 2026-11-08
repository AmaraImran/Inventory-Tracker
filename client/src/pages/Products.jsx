import { useEffect, useState } from "react";
import api from "../api/axios";
import { Pencil, Trash2 } from "lucide-react";
const money = (n) => "Rs " + Number(n || 0).toLocaleString();
const empty = { name: "", sku: "", category: "", costPrice: "", salePrice: "", stock: "", lowStockThreshold: 5 };

const input =
  "w-full rounded-lg border border-cream/20 bg-navy px-3 py-2 text-cream placeholder:text-cream/40 focus:border-coral focus:outline-none";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const limit = 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));

 const load = async () => {
  setLoading(true);
  try {
    const res = await api.get("/products", {
      params: { search, page, limit, lowStock: lowOnly || undefined },
    });
    setProducts(res.data.products);
    setTotal(res.data.total);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    load();
  }, [search, page, lowOnly]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openAdd = () => {
    setForm(empty);
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (p) => {
    setForm({
      name: p.name,
      sku: p.sku || "",
      category: p.category || "",
      costPrice: p.costPrice,
      salePrice: p.salePrice,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
    });
    setEditingId(p._id);
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) await api.put(`/products/${editingId}`, form);
      else await api.post("/products", form);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">Products</h1>
        <button onClick={openAdd} className="rounded-lg bg-coral px-4 py-2 font-semibold text-white">
          + Add product
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <input
          className={input + " max-w-xs"}
          placeholder="Search by name..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={lowOnly}
            onChange={(e) => { setLowOnly(e.target.checked); setPage(1); }}
          />
          Low stock only
        </label>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-cream/10 bg-card">
        <table className="w-full text-left text-sm">
          <thead className="text-cream/50">
            <tr>
              <th className="p-4 font-normal">Name</th>
              <th className="font-normal">Category</th>
              <th className="font-normal">Cost</th>
              <th className="font-normal">Price</th>
              <th className="font-normal">Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
           {loading && (
  <tr><td colSpan="6" className="p-6 text-center text-cream/60">Loading...</td></tr>
)}
{!loading && products.length === 0 && (
  <tr><td colSpan="6" className="p-6 text-center text-cream/60">No products found.</td></tr>
)}
           {!loading && products.map((p) => {
              const low = p.stock <= p.lowStockThreshold;
              return (
             <tr key={p._id} className="border-t border-cream/10 transition hover:bg-cream/5">
                  <td className="p-4">
                    {p.name}
                    {p.sku && <span className="ml-2 text-xs text-cream/40">{p.sku}</span>}
                  </td>
                  <td>{p.category}</td>
                  <td>{money(p.costPrice)}</td>
                  <td>{money(p.salePrice)}</td>
                  <td>
                    <span className={low ? "rounded-full bg-coral/20 px-2 py-0.5 text-coral" : ""}>
                      {p.stock}
                    </span>
                  </td>
                <td className="pr-4">
  <div className="flex justify-end gap-1">
    <button
      onClick={() => openEdit(p)}
      title="Edit"
      aria-label="Edit product"
      className="rounded-lg p-2 text-cream/50 transition hover:bg-cream/10 hover:text-cream"
    >
      <Pencil size={16} />
    </button>
    <button
      onClick={() => handleDelete(p._id)}
      title="Delete"
      aria-label="Delete product"
      className="rounded-lg p-2 text-cream/50 transition hover:bg-red-500/15 hover:text-red-400"
    >
      <Trash2 size={16} />
    </button>
  </div>
</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-cream/60">{total} products</span>
        <div className="flex items-center gap-3">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-cream/20 px-3 py-1 disabled:opacity-40">Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded-lg border border-cream/20 px-3 py-1 disabled:opacity-40">Next</button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-3 rounded-2xl bg-card p-6">
            <h2 className="text-xl font-semibold">{editingId ? "Edit product" : "Add product"}</h2>
            {error && <p className="rounded-lg bg-coral/15 p-2 text-sm text-coral">{error}</p>}

            <input className={input} name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
            <div className="grid grid-cols-2 gap-3">
              <input className={input} name="sku" placeholder="SKU (optional)" value={form.sku} onChange={handleChange} />
              <input className={input} name="category" placeholder="Category" value={form.category} onChange={handleChange} />
              <input className={input} name="costPrice" type="number" min="0" placeholder="Cost price" value={form.costPrice} onChange={handleChange} required />
              <input className={input} name="salePrice" type="number" min="0" placeholder="Sale price" value={form.salePrice} onChange={handleChange} required />
              <input className={input} name="stock" type="number" min="0" placeholder="Stock" value={form.stock} onChange={handleChange} required />
              <input className={input} name="lowStockThreshold" type="number" min="0" placeholder="Low stock at" value={form.lowStockThreshold} onChange={handleChange} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-cream/20 px-4 py-2">Cancel</button>
              <button type="submit" className="rounded-lg bg-coral px-4 py-2 font-semibold text-white">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}