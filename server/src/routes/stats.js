import { Router } from "express";
import { summary, daily, topProducts } from "../controllers/statsController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.get("/summary", summary);
router.get("/daily", daily);
router.get("/top-products", topProducts);

export default router;