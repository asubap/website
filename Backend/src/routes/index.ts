import { Router, Request, Response } from "express";
import { checkRole } from "middleware/auth";
import { requireAuth } from "middleware/auth";

const router = Router();

router.get("/", (req: Request, res: Response) => {
    res.json({ message: "Hello, TypeScript + Express!" });
});

// example of protected route
router.get('/protected', requireAuth, (req, res) => {
    res.json({ message: 'Protected route' });
  });

export default router;