import { Router } from "express";
import { MemberInfoController } from "../controllers/memberInfoController";

const memberInfoRoutes = Router();

const controller = new MemberInfoController();
memberInfoRoutes
// general routes
.get('/', controller.getAllMemberInfo.bind(controller)) // get all member info
.post('/', controller.getMemberInfo.bind(controller)) // get member info
.post('/search', controller.search.bind(controller)) // search for a member

// admin routes
.post('/edit-member-info', controller.editMemberInfo.bind(controller)) // edit member info
.post('/delete-member', controller.deleteMember.bind(controller)) // remove member
.post('/add-member', controller.addMember.bind(controller)) // add member


export default memberInfoRoutes;