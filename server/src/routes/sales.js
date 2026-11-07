import { Router } from "express";
import { createSale, getSale, listSales } from "../controllers/saleController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.post("/", createSale);
router.get("/", listSales);
router.get("/:id", getSale);
export default router;