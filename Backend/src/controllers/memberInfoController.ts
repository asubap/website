import { Request, Response } from "express";
import { MemberInfoService } from "../services/memberInfoService";
import extractToken from "../utils/extractToken";
import UserRoleService from "../services/userRoleService";
export class MemberInfoController {
    private memberInfoService: MemberInfoService;
    private userRoleService: UserRoleService;

    constructor() {
        this.memberInfoService = new MemberInfoService();
        this.userRoleService = new UserRoleService();
    }

    /**
     * Get member info
     * @param req 
     * @param res 
     * @returns information about the member
     */
    async getMemberInfo(req: Request, res: Response) {
        try {
            const token = extractToken(req);
            if (!token) {
                res.status(401).json({ error: 'No authorization token provided' });
                return;
            }

            this.memberInfoService.setToken(token as string);

            // get member user_id
            const { user_email } = req.body;

            if (!user_email) {
                res.status(400).json({ error: 'User email is required' });
                return;
            }

            const user_id = await this.userRoleService.getUserID(user_email);

            // get member info
            const memberInfo = await this.memberInfoService.getMemberInfo(user_id);

            res.status(200).json(memberInfo);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * Search for a query related to the member info table with email as well
     * ANYONE can search
     * @param req 
     * @param res 
     * @returns information about the members and their matching info to the query
     */
    async search(req: Request, res: Response) {
        try {
            const token = extractToken(req);
            if (!token) {
                res.status(401).json({ error: 'No authorization token provided' });
                return;
            }

            this.memberInfoService.setToken(token);

            const { search_query } = req.body;

            if (!search_query) {
                res.status(400).json({ error: 'Search query is required' });
                return;
            }

            // search for query related to the member info table
            const memberInfo = await this.memberInfoService.search(search_query);


            res.status(200).json(memberInfo);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }

    }

    /**
     * Edit member info
     * @param req 
     * @param res 
     * @returns the updated member info
     */
    async editMemberInfo(req: Request, res: Response) {
        const { user_email, bio, internship, first_name, last_name, year, major, contact_me } = req.body;

        const token = extractToken(req);
        if (!token) {
            res.status(401).json({ error: 'No authorization token provided' });
            return;
        }

        this.memberInfoService.setToken(token);

        if (!user_email) {
            res.status(400).json({ error: 'User email is required' });
            return;
        }

        // Build an update object only with non-empty fields
        const updateFields: Record<string, string> = {};
        if (bio && bio.trim() !== '') {
            updateFields.bio = bio;
        }
        if (internship && internship.trim() !== '') {
            updateFields.internship = internship;
        }
        if (first_name && first_name.trim() !== '') {
            updateFields.first_name = first_name;
        }
        if (last_name && last_name.trim() !== '') {
            updateFields.last_name = last_name;
        }
        if (year && year.trim() !== '') {
            updateFields.year = year;
        }
        if (major && major.trim() !== '') {
            updateFields.major = major;
        }
        if (contact_me && contact_me.trim() !== '') {
            updateFields.contact_me = contact_me;
        }
        
        // If there's nothing to update, respond accordingly
        if (Object.keys(updateFields).length === 0) {
            res.status(400).json({ error: 'No valid update fields provided.' });
            return;
        }

        try {
            const user_id = await this.userRoleService.getUserID(user_email);
            // edit member info
            const memberInfo = await this.memberInfoService.editMemberInfo(user_id, updateFields);

            res.status(200).json(memberInfo);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }


    /**
     * Delete member
     * @param req 
     * @param res 
     * @returns the updated member info
     */
    async deleteMember(req: Request, res: Response) {
        try {
            const token = extractToken(req);

            if (!token) {
                res.status(401).json({ error: 'No authorization token provided' });
                return;
            }

            this.memberInfoService.setToken(token);

            const { user_email } = req.body;
            
            if (!user_email) {
                res.status(400).json({ error: 'User email is required' });
                return;
            }

            const user_id = await this.userRoleService.getUserID(user_email);

            // delete member
            const memberInfo = await this.memberInfoService.deleteMember(user_id);

            res.status(200).json(memberInfo);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * Add member
     * @param req 
     * @param res 
     * @returns the updated member info
     */
    async addMember(req: Request, res: Response) {
        try {
            const token = extractToken(req);

            if (!token) {
                res.status(401).json({ error: 'No authorization token provided' });
                return;
            }

            this.memberInfoService.setToken(token);

            const { user_email } = req.body;

            if (!user_email) {
                res.status(400).json({ error: 'User email is required' });
                return;
            }

            const user_id = await this.userRoleService.getUserID(user_email);

            // add member
            const memberInfo = await this.memberInfoService.addMember(user_id);

            res.status(200).json(memberInfo);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
}