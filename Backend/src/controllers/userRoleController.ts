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
            if (!token) {
                res.status(401).json({ error: 'No authorization token provided' });
                return;
            }

            this.userRoleService.setToken(token as string);
            const { user_id } = req.body;
            
            if (!user_id) {
                res.status(400).json({ error: 'User ID is required' });
                return;
            }

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
            const { user_id, role } = req.body;

            if (!user_id || !role) {
                res.status(400).json({ error: 'User ID and role are required' });
                return;
            }

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
            const { user_id, role } = req.body;

            if (!user_id || !role) {
                res.status(400).json({ error: 'User ID and role are required' });
                return;
            }

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
     * Get the session token
     * @param req - The request object
     * @param res - The response object
     */
    async getSession(req: Request, res: Response) {
        try {
            const token = extractToken(req);
            if (!token) {
                res.status(401).json({ error: 'No authorization token provided' });
                return;
            }

            // Return the token for verification
            res.json({ token });
        } catch (error) {
            console.error('Error getting session:', error);
            res.status(500).json({ error: 'Failed to get session' });
            return;
        }
    }
}