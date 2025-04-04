import { Request, Response } from "express";
import { MemberInfoService } from "../services/memberInfoService";
import extractToken from "../utils/extractToken";
import UserRoleService from "../services/userRoleService";
import { EventService } from "../services/eventService";
import { geocodeAddress } from "../utils/geocoding";

export class EventController {
    private eventService: EventService;
    private userRoleService: UserRoleService;

    constructor() {
        this.eventService = new EventService();
        this.userRoleService = new UserRoleService();
    }

    /**
     * Get all events
     * @param req 
     * @param res 
     * @returns 
     */
    async getEvents(req: Request, res: Response) {
        const token = extractToken(req);

        if (!token) {
            res.status(401).json({ error: 'No authorization token provided' });
            return;
        }

        this.eventService.setToken(token as string);

        const events = await this.eventService.getEvents();
        res.json(events);
    }

    /**
     * Get all events by name
     * @param req 
     * @param res 
     * @returns 
     */
    async getEventsByName(req: Request, res: Response) {
        const token = extractToken(req);

        if (!token) {
            res.status(401).json({ error: 'No authorization token provided' });
            return;
        }

        this.eventService.setToken(token as string);

        const { name } = req.body;
        const events = await this.eventService.getEventsByName(name);
        res.json(events);
    }

    /**
     * Add an event
     * @param req 
     * @param res 
     * @returns 
     */
    async addEvent(req: Request, res: Response) {
        const token = extractToken(req);

        if (!token) {
            res.status(401).json({ error: 'No authorization token provided' });
            return;
        }

        this.eventService.setToken(token as string);

        const { user_email, name, date, location, description, time} = req.body;

        if (!user_email || !name || !date || !location || !description || !time) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }


        const { lat, lon } = await geocodeAddress(location);
        const user_id = await this.userRoleService.getUserID(user_email);

        try {
            const event = await this.eventService.addEvent(user_id, name, date, location, description, lat, lon, time);
            res.json(event);
            return;
        } catch (error) {
            res.status(500).json({ error: 'Failed to add event' });
        }
    }

    /**
     * Edit an event
     * @param req 
     * @param res 
     * @returns 
     */
    async editEvent(req: Request, res: Response) {
        const { user_email, event_name, name, date, location, description, time } = req.body;

        const token = extractToken(req);
        
        if (!token) {
            res.status(401).json({ error: 'No authorization token provided' });
            return;
        }

        this.eventService.setToken(token as string);
        
        // Check for required fields
        if (!user_email || !event_name) {
            res.status(400).json({ error: 'user_email and event_name are required.' });
            return;
        }
        
        // Build an update object only with non-empty fields
        const updateFields: Record<string, any> = {};
        if (name && name.trim() !== '') {
            updateFields.name = name;
        }
        if (date && date.trim() !== '') {
            updateFields.date = date;
        }
        if (location && location.trim() !== '') {
            updateFields.location = location;
            const { lat, lon } = await geocodeAddress(location);
            updateFields.location_lat = lat;
            updateFields.location_long = lon;
        }
        if (description && description.trim() !== '') {
            updateFields.description = description;
        }
        if (time && time.trim() !== '') {
            updateFields.time = time;
        }
        
        // If there's nothing to update, respond accordingly
        if (Object.keys(updateFields).length === 0) {
            res.status(400).json({ error: 'No valid update fields provided.' });
            return;
        }
        
        try {
            const event_id = await this.eventService.getEventID(event_name);
            const updatedEvent = await this.eventService.editEvent(event_id, updateFields);
            if (updatedEvent) {
                res.json("Event updated successfully");
            } else {
                res.status(500).json({ error: 'Failed to update event' });
            }
        } catch (error) {
            console.error('Error updating event:', error);
            res.status(500).json({ error: 'Server error.' });
        }
    }

    /**
     * Delete an event
     * @param req 
     * @param res 
     * @returns 
     */
    async deleteEvent(req: Request, res: Response) {
        const token = extractToken(req);

        if (!token) {
            res.status(401).json({ error: 'No authorization token provided' });
            return;
        }

        this.eventService.setToken(token as string);

        const { event_name } = req.body;
        try {
            const event_id = await this.eventService.getEventID(event_name);
            const event = await this.eventService.deleteEvent(event_id);
            if (event) {
                res.json("Event deleted successfully");
            } else {
                res.status(500).json({ error: 'Failed to delete event' });
            }
        } catch (error) {
            if (error instanceof Error && error.message.includes('No event found')) {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Failed to delete event' });
            }
        }
    }

    // return all events (past and present given a date)
    async getEventsByDate(req: Request, res: Response) {
        const token = extractToken(req);

        if (!token) {
            res.status(401).json({ error: 'No authorization token provided' });
            return;
        }

        this.eventService.setToken(token as string);

        const { date } = req.body;
        
        try {
            let events;
            if (date) {
                const formattedDate = new Date(date).toISOString().split('T')[0]; // YYYY-MM-DD
                events = await this.eventService.getEventsByDate(formattedDate);
            } else {
                // get today's date in YYYY-MM-DD format
                const today = new Date().toISOString().split('T')[0];
                events = await this.eventService.getEventsByDate(today);
            }
            res.json(events);
        } catch (error) {
            console.error('Error getting events:', error);
            res.status(500).json({ error: 'Failed to get events' });
        }
    }
}