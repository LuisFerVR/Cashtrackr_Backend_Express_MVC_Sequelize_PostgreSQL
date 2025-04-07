import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
    console.log("desde: /api/budgets");
});

export default router;