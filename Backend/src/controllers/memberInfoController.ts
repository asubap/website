import { Request, Response } from "express";
import { MemberInfoService } from "../services/memberInfoService";
import extractToken from "../utils/extractToken";

export class MemberInfoController {
    private memberInfoService: MemberInfoService;

    constructor() {
        this.memberInfoService = new MemberInfoService();
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
            const { user_id } = req.body;

            if (!user_id) {
                res.status(400).json({ error: 'User ID is required' });
                return;
            }

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
        try {
            const token = extractToken(req);
            if (!token) {
                res.status(401).json({ error: 'No authorization token provided' });
                return;
            }

            this.memberInfoService.setToken(token);

            const { user_id, bio, internship, first_name, last_name, year, major } = req.body;

            if (!user_id || !bio || !internship || !first_name || !last_name || !year || !major) {
                res.status(400).json({ error: 'User ID and all fields are required' });
                return;
            }

            // edit member info
            const memberInfo = await this.memberInfoService.editMemberInfo(user_id, bio, internship, first_name, last_name, year, major);

            res.status(200).json(memberInfo);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }


    /**
     * Edit member bio
     * @param req 
     * @param res 
     * @returns the updated member info
     */
    async editMemberBio(req: Request, res: Response) {
        try {
            const token = extractToken(req);
            if (!token) {
                res.status(401).json({ error: 'No authorization token provided' });
                return;
            }

            this.memberInfoService.setToken(token);

            const { user_id, bio } = req.body;
            
            if (!user_id || !bio) {
                res.status(400).json({ error: 'User ID and bio are required' });
                return;
            }

            // edit member bio
            const memberInfo = await this.memberInfoService.editMemberBio(user_id, bio);

            res.status(200).json(memberInfo);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * Edit member internship
     * @param req 
     * @param res 
     * @returns the updated member info
     */
    async editMemberInternship(req: Request, res: Response) {
        try {
            const token = extractToken(req);
            if (!token) {
                res.status(401).json({ error: 'No authorization token provided' });
                return;
            }

            this.memberInfoService.setToken(token);

            const { user_id, internship } = req.body;
            
            if (!user_id || !internship) {
                res.status(400).json({ error: 'User ID and internship are required' });
                return;
            }

            // edit member internship
            const memberInfo = await this.memberInfoService.editMemberInternship(user_id, internship);

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

            const { user_id } = req.body;
            
            if (!user_id) {
                res.status(400).json({ error: 'User ID is required' });
                return;
            }

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

            const { user_id } = req.body;

            if (!user_id) {
                res.status(400).json({ error: 'User ID is required' });
                return;
            }

            // add member
            const memberInfo = await this.memberInfoService.addMember(user_id);

            res.status(200).json(memberInfo);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * Edit member first name
     * @param req 
     * @param res 
     * @returns the updated member info
     */
    async editMemberFirstName(req: Request, res: Response) {
        try {
            const token = extractToken(req);

            if (!token) {
                res.status(401).json({ error: 'No authorization token provided' });
                return;
            }

            this.memberInfoService.setToken(token);

            const { user_id, first_name } = req.body;

            if (!user_id || !first_name) {
                res.status(400).json({ error: 'User ID and first name are required' });
                return;
            }

            // edit member first name
            const memberInfo = await this.memberInfoService.editMemberFirstName(user_id, first_name);

            res.status(200).json(memberInfo);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * Edit member last name
     * @param req 
     * @param res 
     * @returns the updated member info
     */
    async editMemberLastName(req: Request, res: Response) {
        try {
            const token = extractToken(req);

            if (!token) {
                res.status(401).json({ error: 'No authorization token provided' });
                return;
            }
            
            this.memberInfoService.setToken(token);

            const { user_id, last_name } = req.body;

            if (!user_id || !last_name) {
                res.status(400).json({ error: 'User ID and last name are required' });
                return;
            }

            // edit member last name
            const memberInfo = await this.memberInfoService.editMemberLastName(user_id, last_name);

            res.status(200).json(memberInfo);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * Edit member year
     * @param req 
     * @param res 
     * @returns the updated member info
     */
    async editMemberYear(req: Request, res: Response) {
        try {
            const token = extractToken(req);

            if (!token) {
                res.status(401).json({ error: 'No authorization token provided' });
                return;
            }
            
            this.memberInfoService.setToken(token);

            const { user_id, year } = req.body;

            if (!user_id || !year) {
                res.status(400).json({ error: 'User ID and year are required' });
                return;
            }

            // edit member year
            const memberInfo = await this.memberInfoService.editMemberYear(user_id, year);

            res.status(200).json(memberInfo);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * Edit member major
     * @param req 
     * @param res 
     * @returns the updated member info
     */
    async editMemberMajor(req: Request, res: Response) {
        try {
            const token = extractToken(req);

            if (!token) {
                res.status(401).json({ error: 'No authorization token provided' });
                return;
            }
            
            this.memberInfoService.setToken(token);

            const { user_id, major } = req.body;

            if (!user_id || !major) {
                res.status(400).json({ error: 'User ID and major are required' });
                return;
            }

            // edit member major
            const memberInfo = await this.memberInfoService.editMemberMajor(user_id, major);

            res.status(200).json(memberInfo);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
}