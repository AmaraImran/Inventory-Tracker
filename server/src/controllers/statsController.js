import mongoose from "mongoose";
import Sale from "../models/Sale.js";
import Product from "../models/Product.js";

const TZ = "Asia/Karachi";
const OFFSET = 5 * 60 * 60 * 1000; // Pakistan is UTC+5
const DAY = 24 * 60 * 60 * 1000;

// midnight today in Pakistan time (works on Vercel, which runs in UTC)
const startOfToday = () =>
  new Date(Math.floor((Date.now() + OFFSET) / DAY) * DAY - OFFSET);

// aggregate() does NOT auto-convert ids, so we convert manually
const ownerId = (req) => new mongoose.Types.ObjectId(req.userId);

export async function summary(req, res) {
  const [today] = await Sale.aggregate([
    { $match: { owner: ownerId(req), createdAt: { $gte: startOfToday() } } },
    { $group: { _id: null, sales: { $sum: "$total" }, profit: { $sum: "$profit" }, count: { $sum: 1 } } },
  ]);

  const lowStockCount = await Product.countDocuments({
    owner: req.userId,
    $expr: { $lte: ["$stock", "$lowStockThreshold"] },
  });

  res.json({
    sales: today?.sales || 0,
    profit: today?.profit || 0,
    count: today?.count || 0,
    lowStockCount,
  });
}

export async function daily(req, res) {
  const days = Number(req.query.days) || 7;
  const since = new Date(startOfToday().getTime() - (days - 1) * DAY);

  const data = await Sale.aggregate([
    { $match: { owner: ownerId(req), createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: TZ } },
        total: { $sum: "$total" },
        profit: { $sum: "$profit" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({ data: data.map((d) => ({ date: d._id, total: d.total, profit: d.profit })) });
}

export async function topProducts(req, res) {
  const data = await Sale.aggregate([
    { $match: { owner: ownerId(req) } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        name: { $first: "$items.name" },
        qtySold: { $sum: "$items.qty" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
      },
    },
    { $sort: { qtySold: -1 } },
    { $limit: 5 },
  ]);

  res.json({ data });
}