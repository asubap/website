import { Router, Request, Response } from "express";
import userRoleRoutes from "./roles";
import memberInfoRoutes from "./memberInfo";

const router = Router();

router.get("/", (req: Request, res: Response) => {
    res.json({ message: "Hello, TypeScript + Express!" });
});

router.use("/roles", userRoleRoutes);
router.use("/member-info", memberInfoRoutes);

export default router;