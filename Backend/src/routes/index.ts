import { Router, Request, Response } from "express";
import userRoleRoutes from "./roles";
import authRoutes from "./auth";

const router = Router();

router.get("/", (req: Request, res: Response) => {
    res.json({ message: "Hello, TypeScript + Express!" });
});

router.use("/roles", userRoleRoutes);
router.use("/auth", authRoutes);

export default router;