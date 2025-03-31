import { Request, Response } from "express";
import { db } from "../config/db";

class AuthController {
    signInWithGoogle = async (req: Request, res: Response): Promise<void> => {
        try {
            const { data, error } = await db().auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: 'http://localhost:3000/auth/callback'
                }
            });

            if (error) throw error;
            res.json(data);
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export default new AuthController(); 