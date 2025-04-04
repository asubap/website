import { Router } from "express";
import UserRoleController from "../controllers/userRoleController";

const userRoleRoutes = Router();

const controller = new UserRoleController();
userRoleRoutes
.get('/general-members', controller.getGeneralMembers.bind(controller)) // get all members
.get('/sponsors', controller.getSponsors.bind(controller)) // get all sponsors
.get('/e-board', controller.getOfficers.bind(controller)) // get all officers

.post('/', controller.getUserRoles.bind(controller)) // get
.post('/assign-role', controller.assignRoles.bind(controller)) // assign roles
.post('/remove-role', controller.removeRoles.bind(controller)) // remove roles
.get('/session', controller.getSession.bind(controller)); // for testing purposes

export default userRoleRoutes;