import { Request, Response } from "express";
import UserRoleService from "../services/userRoleService";

class UserRoleController {
    private userRoleService: UserRoleService;

    constructor() {
        this.userRoleService = new UserRoleService();
    }

    getUserRoles = async (req: Request, res: Response) => {
        try {
            const { user_id } = req.body;
            if (!user_id) {
                res.status(400).json({ message: "user_id is required" });
            }
            const userRoles = await this.userRoleService.getUserRoles(user_id);
            res.json(userRoles);
        } catch (error) {
            res.status(500).json({ message: "Error fetching user roles" });
        }
    }

    assignRoles = async (req: Request, res: Response): Promise<void> => {
        try {
            const { user_id, role } = req.body;
            if (!user_id || !role) {
                res.status(400).json({ message: "user_id and role are required" });
                return;
            }
            const assignedRole = await this.userRoleService.assignRole(user_id, role);
            res.json(assignedRole);
        } catch (error) {
            res.status(500).json({ message: "Error assigning role" });
        }
    }
}

export default new UserRoleController();