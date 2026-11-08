import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const money = (n) => "Rs " + Number(n || 0).toLocaleString();
const input =
  "rounded-lg border border-cream/20 bg-navy px-3 py-2 text-cream placeholder:text-cream/40 focus:border-coral focus:outline-none";

export default function NewSale() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]); // [{ product, qty }]
  const [payment, setPayment] = useState("cash");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // load products matching the search (limit 50 is enough for picking)
  useEffect(() => {
    setLoadingProducts(true);
    api
      .get("/products", { params: { search, limit: 50 } })
      .then((res) => setProducts(res.data.products))
      .finally(() => setLoadingProducts(false));
  }, [search]);

  const qtyInCart = (id) => cart.find((c) => c.product._id === id)?.qty || 0;

  const addToCart = (p) => {
    if (qtyInCart(p._id) >= p.stock) return; // can't add more than stock
    setCart((prev) => {
      const found = prev.find((c) => c.product._id === p._id);
      if (found)
        return prev.map((c) =>
          c.product._id === p._id ? { ...c, qty: c.qty + 1 } : c,
        );
      return [...prev, { product: p, qty: 1 }];
    });
  };

  const changeQty = (id, qty) => {
    setCart(
      (prev) =>
        prev
          .map((c) =>
            c.product._id === id
              ? { ...c, qty: Math.min(Math.max(qty, 0), c.product.stock) }
              : c,
          )
          .filter((c) => c.qty > 0), // qty 0 removes the item
    );
  };

  const total = cart.reduce((sum, c) => sum + c.product.salePrice * c.qty, 0);

  const handleSubmit = async () => {
    setError("");
    setSaving(true);
    try {
      await api.post("/sales", {
        items: cart.map((c) => ({ productId: c.product._id, qty: c.qty })),
        paymentMethod: payment,
      });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save the sale");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">New Sale</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* left: pick products */}
        <div className="space-y-3 lg:col-span-2">
          <input
            className={input + " w-full"}
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {products.map((p) => {
              const out = p.stock === 0;
              return (
                <button
                  key={p._id}
                  onClick={() => addToCart(p)}
                  disabled={out || qtyInCart(p._id) >= p.stock}
                  className="rounded-2xl border border-cream/10 bg-card p-4 text-left hover:border-coral disabled:opacity-40"
                >
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-cream/60">{money(p.salePrice)}</p>
                  <p
                    className={`mt-1 text-xs ${p.stock <= p.lowStockThreshold ? "text-coral" : "text-cream/50"}`}
                  >
                    {out ? "Out of stock" : `${p.stock} in stock`}
                  </p>
                </button>
              );
            })}
            {loadingProducts && <p className="text-cream/60">Loading...</p>}
            {!loadingProducts && products.length === 0 && (
              <p className="text-cream/60">No products found.</p>
            )}
          </div>
        </div>

        {/* right: cart */}
        <div className="h-fit space-y-4 rounded-2xl border border-cream/10 bg-card p-5">
          <h2 className="text-lg font-semibold">Cart</h2>

          {cart.length === 0 && (
            <p className="text-sm text-cream/60">Click a product to add it.</p>
          )}

          <ul className="space-y-3">
            {cart.map((c) => (
              <li
                key={c.product._id}
                className="flex items-center gap-2 text-sm"
              >
                <span className="flex-1 truncate">{c.product.name}</span>
                <input
                  type="number"
                  min="0"
                  max={c.product.stock}
                  value={c.qty}
                  onChange={(e) =>
                    changeQty(c.product._id, Number(e.target.value))
                  }
                  className={input + " w-16 py-1"}
                />
                <span className="w-20 text-right">
                  {money(c.product.salePrice * c.qty)}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between border-t border-cream/10 pt-3 text-lg font-semibold">
            <span>Total</span>
            <span>{money(total)}</span>
          </div>

          <select
            className={input + " w-full"}
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="online">Online</option>
          </select>

          {error && (
            <p className="rounded-lg bg-coral/15 p-2 text-sm text-coral">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={cart.length === 0 || saving}
            className="w-full rounded-lg bg-coral py-3 font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Complete sale"}
          </button>
        </div>
      </div>
    </div>
  );
}
