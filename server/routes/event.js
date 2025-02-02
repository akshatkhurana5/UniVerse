const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Event = require("../models/Event");
const Club = require("../models/Club");

// Get all events
router.get("/", wrapAsync(async (req, res) => {
    const events = await Event.find()
        .populate("createdBy", "name") 
        .sort({ date: 1 });

    res.status(200).json({ events });
}));


// Get a specific event
router.get("/:id", wrapAsync(async (req, res) => {
    const event = await Event.findById(req.params.id)
        .populate("createdBy", "name email")
        .populate("club", "name description");

    if (!event) return res.status(404).json({ message: "Event not found" });

    res.status(200).json({ event });
}));

// Create an event (User or Club)
router.post("/", wrapAsync(async (req, res) => {
    const { eventDetails } = req.body;
    const{createdBy, createdByModel} = eventDetails;
    if (!['User', 'Club'].includes(createdByModel)) {
        return res.status(400).json({ message: "Invalid createdByModel. Must be 'User' or 'Club'." });
    }

    const validCreator = createdByModel === 'User' ? await User.findById(createdBy) : await Club.findById(createdBy);
    if (!validCreator) return res.status(404).json({ message: `${createdByModel} not found.` });

    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format." });
    }

    const event = new Event({ name, description, date: eventDate, time, location, createdBy, createdByModel });

    if (req.files) {
        req.files.forEach(file => {
            event.media.push({ filename: file.filename, url: file.path });
        });
    }

    const savedEvent = await event.save();
    res.status(201).json({ message: "Event created successfully", event: savedEvent });
}));

// Update an event
router.put("/:id", wrapAsync(async (req, res) => {
    let updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedEvent) return res.status(404).json({ message: "Event not found" });

    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        updatedEvent.media.push({ filename, url });
        await updatedEvent.save();
    }

    res.status(200).json({ message: "Event updated successfully", event: updatedEvent });
}));

// Delete an event
router.delete("/:id", wrapAsync(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: "Event not found" });

    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Event deleted successfully" });
}));


// Attend an event
router.put("/:id/attend", wrapAsync(async (req, res) => {
    const { userId } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) return res.status(404).json({ message: "Event not found." });

    if (event.attendees.includes(userId)) {
        return res.status(400).json({ message: "User already joined this event." });
    }

    event.attendees.push(userId);
    await event.save();

    res.status(200).json({ message: "Successfully joined event", attendees: event.attendees.length });
}));

// Leave event
router.put(":id/leave",wrapAsync(async(req,res)=>{
    const {userId}=req.body;
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: "Event not found." });

    event.attendees = event.attendees.filter(attendee => attendee.toString() !== userId);
    await event.save();

    res.status(200).json({ message: "Successfully left event", attendees: event.attendees.length });
}));




module.exports = router;
