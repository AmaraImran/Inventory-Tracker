import { Router } from "express";
import { createProduct, listProducts,updateProduct, deleteProduct,getProduct } from "../controllers/productController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.post("/", createProduct);
router.get("/", listProducts);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.get("/:id", getProduct);
export default router;