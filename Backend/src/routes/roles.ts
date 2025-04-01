import { Router } from "express";
import UserRoleController from "../controllers/userRoleController";

const userRoleRoutes = Router();

const controller = new UserRoleController();
userRoleRoutes
.post('/', controller.getUserRoles.bind(controller)) // get
.post('/assign-role', controller.assignRoles.bind(controller)) // assign roles
.post('/remove-role', controller.removeRoles.bind(controller)) // remove roles
.get('/session', controller.getSession.bind(controller)); // for testing purposes

export default userRoleRoutes;