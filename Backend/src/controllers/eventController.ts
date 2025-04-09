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
        try {
            const token = extractToken(req);

            if (!token) {
                res.status(401).json({ error: 'No authorization token provided' });
                return;
            }

            this.eventService.setToken(token as string);

            const events = await this.eventService.getEvents();
            res.json(events);
        } catch (error) {
            console.error('Error fetching events:', error);
            res.status(500).json({ error: 'Failed to fetch events' });
        }
    }

    /**
     * Get all events by name
     * @param req 
     * @param res 
     * @returns 
     */
    async getEventByID(req: Request, res: Response) {
        const token = extractToken(req);

        if (!token) {
            res.status(401).json({ error: 'No authorization token provided' });
            return;
        }

        this.eventService.setToken(token as string);

        try {
            const { event_id } = req.body;
            const event = await this.eventService.getEventByID(event_id);
            res.json(event);
        } catch (error) {
            console.error('Error fetching event:', error);
            res.status(500).json({ error: 'Failed to fetch event' });
        }
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

        const { user_email, name, date, location, description, time, sponsors} = req.body;

        if (!user_email || !name || !date || !location || !description || !time || !sponsors) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }



        const { lat, lon } = await geocodeAddress(location);
        const user_id = await this.userRoleService.getUserID(user_email);

        try {
            const event = await this.eventService.addEvent(user_id, name, date, location, description, lat, lon, time, sponsors);
            // res.json(event);
            res.json("Event added successfully");
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
        const { event_id, name, date, location, description, time, sponsors} = req.body;

        const token = extractToken(req);
        
        if (!token) {
            res.status(401).json({ error: 'No authorization token provided' });
            return;
        }

        this.eventService.setToken(token as string);
        
        // Check for required fields
        if (!event_id) {
            res.status(400).json({ error: 'event_id is required.' });
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
        if (sponsors && sponsors.length > 0) {
            updateFields.sponsors = sponsors;
        }
        
        // If there's nothing to update, respond accordingly
        if (Object.keys(updateFields).length === 0) {
            res.status(400).json({ error: 'No valid update fields provided.' });
            return;
        }
        
        try {
            const updatedEvent = await this.eventService.editEvent(event_id, updateFields);
            if (!updatedEvent) {
                res.status(404).json({ error: 'Event not found.' });
                return;
            }
            res.json("Event updated successfully");
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

        const { event_id } = req.body;
        try {
            const event = await this.eventService.deleteEvent(event_id);
            res.json("Event deleted successfully");
        } catch (error) {
            if (error instanceof Error && error.message.includes('No event found')) {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Failed to delete event' });
            }
        }
    }
}