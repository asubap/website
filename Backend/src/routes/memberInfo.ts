import { Router } from "express";
import { MemberInfoController } from "../controllers/memberInfoController";

const memberInfoRoutes = Router();

const controller = new MemberInfoController();
memberInfoRoutes
.post('/', controller.getMemberInfo.bind(controller)) // get member info
.post('/search', controller.search.bind(controller)) // search for a member
.post('/edit-member-info', controller.editMemberInfo.bind(controller)) // edit member info
.post('/edit-member-bio', controller.editMemberBio.bind(controller)) // edits member bio info
.post('/edit-member-internship', controller.editMemberInternship.bind(controller)) // edits member internship info
.post('/edit-member-first-name', controller.editMemberFirstName.bind(controller)) // edit member first name
.post('/edit-member-last-name', controller.editMemberLastName.bind(controller)) // edit member last name
.post('/edit-member-year', controller.editMemberYear.bind(controller)) // edit member year
.post('/edit-member-major', controller.editMemberMajor.bind(controller)) // edit member major
.post('/delete-member', controller.deleteMember.bind(controller)) // remove member
.post('/add-member', controller.addMember.bind(controller)) // add member


export default memberInfoRoutes;