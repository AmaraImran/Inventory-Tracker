import Product from "../models/Product.js";

export async function createProduct(req, res) {
  const { name, sku, category, costPrice, salePrice, stock, lowStockThreshold } = req.body;

  if (!name || costPrice == null || salePrice == null)
    return res.status(400).json({ message: "Name, cost price and sale price are required" });

  const product = await Product.create({
    owner: req.userId,
    name, sku, category, costPrice, salePrice, stock, lowStockThreshold,
  });

  res.status(201).json({ product });
}
export async function getProduct(req, res) {
  const product = await Product.findOne({
    _id: req.params.id,
    owner: req.userId,
  });

  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ product });
}
export async function listProducts(req, res) {
  const { search, category, page = 1, limit = 10 } = req.query;

  const filter = { owner: req.userId };
  if (search) filter.name = { $regex: search, $options: "i" };
  if (category) filter.category = category;
   if (req.query.lowStock === "true")
  filter.$expr = { $lte: ["$stock", "$lowStockThreshold"] };
  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Product.countDocuments(filter);

  res.json({ products, total, page: Number(page) });
}
export async function updateProduct(req, res) {
    delete req.body.owner;
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, owner: req.userId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ product });
}

export async function deleteProduct(req, res) {
  const product = await Product.findOneAndDelete({
    _id: req.params.id,
    owner: req.userId,
  });

  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ message: "Product deleted" });
}