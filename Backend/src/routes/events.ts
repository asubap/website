import { Router } from "express";
import { EventController } from "../controllers/eventController";


const eventRoutes = Router();

const controller = new EventController();
eventRoutes
// general routes
.get('/', controller.getEvents.bind(controller)) // get all events
.post('/', controller.getEventsByName.bind(controller)) // get all events
.post('/get-events-by-date', controller.getEventsByDate.bind(controller)) // get all events by date


// admin routes
.post('/add-event', controller.addEvent.bind(controller)) // add an event
.post('/edit-event', controller.editEvent.bind(controller)) // edit an event
.post('/delete-event', controller.deleteEvent.bind(controller)) // delete an event

export default eventRoutes;