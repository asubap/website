import { Request, Response } from "express";
import UserRoleService from "../services/userRoleService";
import extractToken from "../utils/extractToken";

export default class UserRoleController {
    private userRoleService: UserRoleService;

    /**
     * Constructor for the UserRoleController
     */
    constructor() {
        this.userRoleService = new UserRoleService();
    }

    /**
     * Get the roles of a user
     * @param req - The request object
     * @param res - The response object
     */
    async getUserRoles(req: Request, res: Response) {
        try {
            const token = extractToken(req);
            console.log(token);
            if (!token) {
                res.status(401).json({ error: 'No authorization token provided' });
                return;
            }

            this.userRoleService.setToken(token as string);
            const { user_email } = req.body;
            
            if (!user_email) {
                res.status(400).json({ error: 'User email is required' });
                return;
            }

            const user_id = await this.userRoleService.getUserID(user_email);
            console.log(user_id);

            const roles = await this.userRoleService.getUserRoles(user_id);
            res.json(roles);
        } catch (error) {
            console.error('Error getting user roles:', error);
            res.status(500).json({ error: 'Failed to get user roles' });
            return;
        }
    }

    /**
     * Assign a role to a user
     * @param req - The request object
     * @param res - The response object
     */
    async assignRoles(req: Request, res: Response) {
        try {
            const token = extractToken(req);
            if (!token) {
                res.status(401).json({ error: 'No authorization token provided' });
                return;
            }

            this.userRoleService.setToken(token as string);
            const { user_email, role } = req.body;

            if (!user_email || !role) {
                res.status(400).json({ error: 'User email and role are required' });
                return;
            }

            const user_id = await this.userRoleService.getUserID(user_email);

            const result = await this.userRoleService.assignRole(user_id, role);

            if (!result) {
                res.status(400).json({ error: 'User already has this role' });
                return;
            } else {
                res.json({ message: 'Role assigned successfully' });
            }
        } catch (error) {
            console.error('Error assigning role:', error);
            res.status(500).json({ error: 'Failed to assign role' });
            return;
        }
    }

    /**
     * Remove a role from a user
     * @param req - The request object
     * @param res - The response object
     */
    async removeRoles(req: Request, res: Response) {
        try {
            const token = extractToken(req);
            if (!token) {
                res.status(401).json({ error: 'No authorization token provided' });
                return;
            }

            this.userRoleService.setToken(token as string);
            const { user_email, role } = req.body;

            if (!user_email || !role) {
                res.status(400).json({ error: 'User email and role are required' });
                return;
            }

            const user_id = await this.userRoleService.getUserID(user_email);

            const result = await this.userRoleService.removeRole(user_id, role);

            if (!result) {
                res.status(400).json({ error: 'User does not have this role' });
                return;
            } else {
                res.json({ message: 'Role removed successfully' });
            }
        } catch (error) {
            console.error('Error removing role:', error);
            res.status(500).json({ error: 'Failed to remove role' });
            return;
        }
    }

    /**
     * Get the session token or Supabase login URL
     * @param req - The request object
     * @param res - The response object
     */
    async getSession(req: Request, res: Response) {
        try {
            const token = extractToken(req);
            
            // If no token, return Supabase login URL
            if (!token) {
                const supabaseUrl = process.env.VITE_SUPABASE_URL;
                const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

                if (!supabaseUrl || !supabaseKey) {
                    res.status(500).json({ error: 'Supabase configuration missing' });
                    return;
                }

                const loginUrl = `${supabaseUrl}/auth/v1/authorize?` +
                    `provider=google` +
                    `&redirect_to=${encodeURIComponent(process.env.FRONTEND_URL || 'http://localhost:3000')}`;
                
                res.json({ 
                    loginUrl,
                    message: 'Please login with Google via Supabase'
                });
                return;
            }

            // If token exists, return it
            res.json({ 
                token,
                message: 'Successfully authenticated'
            });
        } catch (error) {
            console.error('Error handling session:', error);
            res.status(500).json({ error: 'Failed to handle session' });
            return;
        }
    }
}