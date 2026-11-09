import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Sale from "./models/Sale.js";

const DEMO_EMAIL = "demo@stockly.com";

const productData = [
  ["Basmati Rice 5kg", "RICE-5KG", "Grocery", 1400, 1600, 25, 5],
  ["Cooking Oil 1L", "OIL-1L", "Grocery", 520, 580, 3, 5],
  ["Sugar 1kg", "SUG-1KG", "Grocery", 135, 150, 40, 10],
  ["Tea Pack 190g", "TEA-190", "Grocery", 310, 350, 18, 5],
  ["Lux Soap", "SOAP-001", "Personal Care", 90, 110, 60, 10],
  ["Shampoo 200ml", "SHMP-200", "Personal Care", 280, 340, 4, 5],
  ["Phone Charger", "CHG-001", "Electronics", 350, 500, 12, 3],
  ["USB Cable", "USB-001", "Electronics", 120, 200, 2, 3],
  ["Biscuits Pack", "BISC-01", "Snacks", 45, 60, 80, 15],
  ["Cold Drink 1.5L", "DRK-15", "Beverages", 130, 160, 30, 8],
];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

await mongoose.connect(process.env.MONGO_URI);

// remove old demo data so the script can be re-run
const old = await User.findOne({ email: DEMO_EMAIL });
if (old) {
  await Sale.deleteMany({ owner: old._id });
  await Product.deleteMany({ owner: old._id });
  await old.deleteOne();
}

const user = await User.create({
  name: "Demo User",
  email: DEMO_EMAIL,
  passwordHash: await bcrypt.hash("demo1234", 10),
  shopName: "Demo General Store",
});

const products = await Product.insertMany(
  productData.map(([name, sku, category, costPrice, salePrice, stock, lowStockThreshold]) => ({
    owner: user._id, name, sku, category, costPrice, salePrice, stock, lowStockThreshold,
  }))
);

// ~14 days of sales, 2-5 per day
const sales = [];
for (let day = 13; day >= 0; day--) {
  for (let n = 0; n < rand(2, 5); n++) {
    const picked = [...products].sort(() => Math.random() - 0.5).slice(0, rand(1, 3));
    const items = picked.map((p) => ({
      product: p._id, name: p.name, qty: rand(1, 3), price: p.salePrice, cost: p.costPrice,
    }));
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    const cost = items.reduce((s, i) => s + i.cost * i.qty, 0);

    const date = new Date(Date.now() - day * 86400000);
    date.setHours(rand(9, 20), rand(0, 59));

    sales.push({
      owner: user._id, items, total, profit: total - cost,
      paymentMethod: ["cash", "card", "online"][rand(0, 2)],
      createdAt: date, updatedAt: date,
    });
  }
}
await Sale.insertMany(sales);

console.log(`Seeded: ${products.length} products, ${sales.length} sales`);
console.log(`Login: ${DEMO_EMAIL} / demo1234`);
await mongoose.disconnect();