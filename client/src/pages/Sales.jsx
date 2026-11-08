import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const money = (n) => "Rs " + Number(n || 0).toLocaleString();
const input =
  "rounded-lg border border-cream/20 bg-navy px-3 py-2 text-cream focus:border-coral focus:outline-none [color-scheme:dark]";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);

  const limit = 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    setLoading(true);
    api
      .get("/sales", {
        params: { page, limit, from: from || undefined, to: to || undefined },
      })
      .then((res) => {
        setSales(res.data.sales);
        setTotal(res.data.total);
      })
      .finally(() => setLoading(false));
  }, [page, from, to]);

  const clearFilters = () => {
    setFrom("");
    setTo("");
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">Sales</h1>
        <Link
          to="/sales/new"
          className="rounded-lg bg-coral px-4 py-2 font-semibold text-white"
        >
          + New sale
        </Link>
      </div>

      <div className="flex flex-wrap items-end gap-4 text-sm">
        <label className="flex flex-col gap-1">
          <span className="text-cream/60">From</span>
          <input
            type="date"
            className={input}
            value={from}
            onChange={(e) => { setFrom(e.target.value); setPage(1); }}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-cream/60">To</span>
          <input
            type="date"
            className={input}
            value={to}
            onChange={(e) => { setTo(e.target.value); setPage(1); }}
          />
        </label>
        {(from || to) && (
          <button onClick={clearFilters} className="py-2 text-cream/60 hover:text-cream">
            Clear
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-cream/10 bg-card">
        <table className="w-full text-left text-sm">
          <thead className="text-cream/50">
            <tr>
              <th className="p-4 font-normal">Date</th>
              <th className="font-normal">Items</th>
              <th className="font-normal">Payment</th>
              <th className="font-normal">Total</th>
              <th className="pr-4 font-normal">Profit</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="5" className="p-6 text-center text-cream/60">Loading...</td></tr>
            )}
            {!loading && sales.length === 0 && (
              <tr><td colSpan="5" className="p-6 text-center text-cream/60">No sales found.</td></tr>
            )}
            {!loading &&
              sales.map((s) => (
                <tr key={s._id} className="border-t border-cream/10 transition hover:bg-cream/5">
                  <td className="p-4 whitespace-nowrap">
                    {new Date(s.createdAt).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="max-w-xs">
                    {s.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
                  </td>
                  <td className="capitalize">{s.paymentMethod}</td>
                  <td>{money(s.total)}</td>
                  <td className="pr-4 text-green-400">{money(s.profit)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-cream/60">{total} sales</span>
        <div className="flex items-center gap-3">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="rounded-lg border border-cream/20 px-3 py-1 disabled:opacity-40"
          >
            Prev
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="rounded-lg border border-cream/20 px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}