import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import api from "../api/axios";

const TZ = "Asia/Karachi";
const money = (n) => "Rs " + Number(n || 0).toLocaleString();
const COLORS = ["#ff6b5b", "#f4ede0", "#5b7db1", "#f5a38f", "#8a9bb8"];
const tooltipStyle = {
  background: "#14213d",
  border: "1px solid rgba(244,237,224,0.2)",
  borderRadius: 12,
  color: "#f4ede0",
};

// the API skips days with no sales, so fill them with 0
function fillDays(data, days) {
  const map = Object.fromEntries(data.map((d) => [d.date, d.total]));
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - 1 - i) * 86400000);
    const key = d.toLocaleDateString("en-CA", { timeZone: TZ });
    const label =
      days === 7
        ? d.toLocaleDateString("en-US", { weekday: "short", timeZone: TZ })
        : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: TZ });
    return { label, total: map[key] || 0 };
  });
}

function Card({ title, right, children }) {
  return (
    <div className="rounded-2xl border border-cream/10 bg-card p-5">
      {(title || right) && (
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [top, setTop] = useState([]);
  const [recent, setRecent] = useState([]);
  const [daily, setDaily] = useState([]);
  const [days, setDays] = useState(7);

  useEffect(() => {
    Promise.all([
      api.get("/stats/summary"),
      api.get("/stats/top-products"),
      api.get("/sales?limit=5"),
    ]).then(([s, t, r]) => {
      setSummary(s.data);
      setTop(t.data.data);
      setRecent(r.data.sales);
    });
  }, []);

  useEffect(() => {
    api.get(`/stats/daily?days=${days}`).then((res) =>
      setDaily(fillDays(res.data.data, days))
    );
  }, [days]);

 if (!summary) return <p className="text-cream/60">Loading...</p>;

  const stats = [
    { label: "Today's sales", value: money(summary.sales) },
    { label: "Today's profit", value: money(summary.profit) },
    { label: "Orders today", value: summary.count },
    { label: "Low stock items", value: summary.lowStockCount, warn: summary.lowStockCount > 0 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Overview</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <p className="text-sm text-cream/60">{s.label}</p>
            <p className={`mt-1 text-2xl font-semibold ${s.warn ? "text-coral" : ""}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card
            title="Sales"
            right={
              <div className="flex rounded-full bg-navy p-1 text-sm">
                {[7, 30].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={`rounded-full px-3 py-1 ${days === d ? "bg-coral text-white" : "text-cream/60"}`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            }
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={daily}>
                <XAxis dataKey="label" stroke="#f4ede0" opacity={0.6} tickLine={false} axisLine={false} fontSize={12} />
                <YAxis stroke="#f4ede0" opacity={0.6} tickLine={false} axisLine={false} fontSize={12} width={50} />
                <Tooltip cursor={{ fill: "transparent" }} contentStyle={tooltipStyle} formatter={(v) => money(v)} />
                <Bar dataKey="total" fill="#ff6b5b" radius={[8, 8, 8, 8]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card title="Top products">
          {top.length === 0 ? (
            <p className="text-cream/60">No sales yet.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={top} dataKey="revenue" nameKey="name" innerRadius={50} outerRadius={80} stroke="none">
                    {top.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "#f4ede0" }} formatter={(v) => money(v)} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="mt-3 space-y-1 text-sm">
                {top.map((p, i) => (
                  <li key={p._id} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="flex-1 truncate">{p.name}</span>
                    <span className="text-cream/60">{p.qtySold} sold</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>

      <Card title="Recent sales">
        {recent.length === 0 ? (
          <p className="text-cream/60">No sales yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-cream/50">
                <tr>
                  <th className="py-2 font-normal">Date</th>
                  <th className="font-normal">Items</th>
                  <th className="font-normal">Payment</th>
                  <th className="font-normal">Total</th>
                  <th className="font-normal">Profit</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((s) => (
                  <tr key={s._id} className="border-t border-cream/10">
                    <td className="py-3">{new Date(s.createdAt).toLocaleDateString("en-GB")}</td>
                    <td>{s.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</td>
                    <td className="capitalize">{s.paymentMethod}</td>
                    <td>{money(s.total)}</td>
                    <td className="text-green-400">{money(s.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}