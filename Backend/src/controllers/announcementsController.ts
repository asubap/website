import { Request, Response } from "express";
import extractToken from "../utils/extractToken";
import UserRoleService from "../services/userRoleService";
import { announcementsService } from "../services/announcementsService";

export class announcementsController {
    private announcementsService: announcementsService;
    private userRoleService: UserRoleService;

    constructor() {
        this.announcementsService = new announcementsService();
        this.userRoleService = new UserRoleService();
    }

    async getannouncements(req: Request, res: Response) {
        const token = extractToken(req);

        if (!token) {
            res.status(401).json({ error: 'No authorization token provided' });
            return;
        }

        this.announcementsService.setToken(token as string);

        const announcements = await this.announcementsService.getannouncements();
        res.json(announcements);
    }

    async getannouncementsByName(req: Request, res: Response) {
        const token = extractToken(req);

        if (!token) {
            res.status(401).json({ error: 'No authorization token provided' });
            return;
        }

        this.announcementsService.setToken(token as string);

        const { announcement_name } = req.body;
        const announcements = await this.announcementsService.getannouncementsByName(announcement_name);
        res.json(announcements);
    }

    async addannouncements(req: Request, res: Response) {
        const token = extractToken(req);

        if (!token) {
            res.status(401).json({ error: 'No authorization token provided' });
            return;
        }

        this.announcementsService.setToken(token as string);

        const { user_email, announcement_name, description} = req.body;

        if (!user_email || !announcement_name || !description) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }


        const user_id = await this.userRoleService.getUserID(user_email);

        try {
            const announcements = await this.announcementsService.addannouncements(user_id, announcement_name, description);
            res.json(announcements);
        } catch (error) {
            res.status(500).json({ error: 'Failed to add announcements' });
        }
    }

    async editannouncements(req: Request, res: Response) {
        const { user_email, announcement_name, title, description } = req.body;

        const token = extractToken(req);
        
        if (!token) {
            res.status(401).json({ error: 'No authorization token provided' });
            return;
        }

        this.announcementsService.setToken(token as string);
        
        // Check for required fields
        if (!user_email || !announcement_name) {
            res.status(400).json({ error: 'user_email and announcement_name are required.' });
            return;
        }
        
        // Build an update object only with non-empty fields
        const updateFields: Record<string, string> = {};
        if (title && title.trim() !== '') {
            updateFields.title = title;
        }
        if (description && description.trim() !== '') {
            updateFields.body = description;
        }
        
        // If there's nothing to update, respond accordingly
        if (Object.keys(updateFields).length === 0) {
            res.status(400).json({ error: 'No valid update fields provided.' });
            return;
        }
        
        try {
            const announcement_id = await this.announcementsService.getannouncementID(announcement_name);
            const updatedAnnouncement = await this.announcementsService.editannouncements(announcement_id, updateFields);
            
            res.json(updatedAnnouncement);
        } catch (error) {
            console.error('Error updating announcement:', error);
            res.status(500).json({ error: 'Server error.' });
        }
    }

    async deleteannouncements(req: Request, res: Response) {
        const token = extractToken(req);

        if (!token) {
            res.status(401).json({ error: 'No authorization token provided' });
            return;
        }

        this.announcementsService.setToken(token as string);

        const { announcement_name } = req.body;
        try {
            const announcement_id = await this.announcementsService.getannouncementID(announcement_name);
            const announcement = await this.announcementsService.deleteannouncements(announcement_id);
            res.json(announcement);    
        } catch (error) {
            if (error instanceof Error && error.message.includes('No announcements found')) {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Failed to delete announcement' });
            }
        }
    }
}