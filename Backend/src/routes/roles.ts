import { Router } from "express";
import userRoleController from "../controllers/userRoleController";

const userRoleRoutes = Router();

userRoleRoutes
.post('/', userRoleController.getUserRoles)
.post('/assign-roles', userRoleController.assignRoles)

export default userRoleRoutes;