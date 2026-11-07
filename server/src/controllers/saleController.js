import Product from "../models/Product.js";
import Sale from "../models/Sale.js";

export async function createSale(req, res) {
  const { items, paymentMethod } = req.body;

  if (!Array.isArray(items) || items.length === 0)
    return res.status(400).json({ message: "Add at least one item" });

  const saleItems = [];
  const reduced = []; // remember what we reduced, in case we need to undo

  try {
    for (const item of items) {
      const qty = Number(item.qty);
      if (!qty || qty < 1)
        throw Object.assign(new Error("Invalid quantity"), { status: 400 });

      // atomic: only reduces stock if enough is available
      const product = await Product.findOneAndUpdate(
        { _id: item.productId, owner: req.userId, stock: { $gte: qty } },
        { $inc: { stock: -qty } },
        { new: true }
      );

      if (!product)
        throw Object.assign(
          new Error("Product not found or not enough stock"),
          { status: 400 }
        );

      reduced.push({ id: product._id, qty });
      saleItems.push({
        product: product._id,
        name: product.name,
        qty,
        price: product.salePrice,
        cost: product.costPrice,
      });
    }
  } catch (err) {
    // undo any stock we already reduced
    for (const r of reduced)
      await Product.updateOne({ _id: r.id }, { $inc: { stock: r.qty } });
    throw err;
  }

  const total = saleItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cost = saleItems.reduce((sum, i) => sum + i.cost * i.qty, 0);

  const sale = await Sale.create({
    owner: req.userId,
    items: saleItems,
    total,
    profit: total - cost,
    paymentMethod,
  });

  res.status(201).json({ sale });
}
export async function listSales(req, res) {
  const { from, to, page = 1, limit = 10 } = req.query;

  const filter = { owner: req.userId };
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lt = new Date(new Date(to).getTime() + 86400000); // include the "to" day
  }

  const sales = await Sale.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Sale.countDocuments(filter);
  res.json({ sales, total, page: Number(page) });
}

export async function getSale(req, res) {
  const sale = await Sale.findOne({ _id: req.params.id, owner: req.userId });
  if (!sale) return res.status(404).json({ message: "Sale not found" });
  res.json({ sale });
}