import { NextFunction, Request, Response } from "express";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization;
        // validate token here
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // verify token
        // const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        // req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
    }
}
