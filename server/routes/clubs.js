const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Club = require("../models/Club");
const Event = require("../models/Event");

// Get all clubs
router.get("/", wrapAsync(async (req, res) => {
    const clubs = await Club.find({});
    res.status(200).json({ clubs });
}));

// Get a specific club by ID
router.get("/:id", wrapAsync(async (req, res) => {
    const club = await Club.findById(req.params.id)/*.populate("members.user", "name email");*/ // Populate members
    if (!club) return res.status(404).json({ message: "Club not found" });
    res.status(200).json({ club });
}));

// Create a new club
router.post("/", wrapAsync(async (req, res) => {
    const { name, description, facultyHead } = req.body;
    if (!name || !description || !facultyHead) {
        return res.status(400).json({ message: "Name, description, and faculty head are required." });
    }

    const newClub = new Club({
        name,
        description,
        facultyHead,
        members: [{ user: facultyHead, role: "President" }] // Automatically assign facultyHead as President
    });

    const savedClub = await newClub.save();
    res.status(201).json(savedClub);
}));

// Update club details
router.put("/:id", wrapAsync(async (req, res) => {
    const updatedClub = await Club.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedClub) return res.status(404).json({ message: "Club not found" });
    res.status(200).json(updatedClub);
}));

// Delete a club
router.delete("/:id", wrapAsync(async (req, res) => {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: "Club not found" });

    await Club.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Club deleted successfully" });
}));

// Join a club with a role
router.put("/:id/join", wrapAsync(async (req, res) => {
    const { userId, role } = req.body;
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: "Club not found" });

    // Check if the user is already a member
    const isMember = club.members.some(member => member.user.toString() === userId);
    if (isMember) return res.status(400).json({ message: "User is already a member" });

    club.members.push({ user: userId, role: role || "Member" }); // Default role to "Member"
    await club.save();
    res.status(200).json({ message: "User joined the club successfully" });
}));

// Leave a club
router.put("/:id/leave", wrapAsync(async (req, res) => {
    const { userId } = req.body;
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: "Club not found" });

    club.members = club.members.filter(member => member.user.toString() !== userId);
    await club.save();
    res.status(200).json({ message: "User left the club successfully" });
}));

// Add an event to a club
router.post("/:id/addEvent", wrapAsync(async (req, res) => {
    const { name, description, date, time, location, createdBy, media } = req.body;

    // Check for missing fields
    if (!name || !description || !date || !time || !location || !createdBy) {
        return res.status(400).json({ message: "All event details are required." });
    }

    // Validate date format
    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format." });
    }

    // Find the club where this event is being added
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: "Club not found" });

    // Create and save new event
    const event = new Event({
        name,
        description,
        date: eventDate,
        time,
        location,
        createdBy,
        media: media || [] // Store media links if provided
    });

    const savedEvent = await event.save();

    // Add event ID to club
    club.events.push(savedEvent._id);
    await club.save();

    res.status(201).json({ message: "Event created successfully", event: savedEvent });
}));


// Delete an event from a club
router.delete("/:id/deleteEvent/:eventId", wrapAsync(async (req, res) => {
    const { id, eventId } = req.params;
    const club = await Club.findById(id);
    if (!club) return res.status(404).json({ message: "Club not found" });

    club.events = club.events.filter(event => event.toString() !== eventId);
    await Event.findByIdAndDelete(eventId);
    await club.save();

    res.status(200).json({ message: "Event deleted successfully" });
}));

module.exports = router;
