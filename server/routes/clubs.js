const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Club= require("../models/Club");
const Event=require("../models/Event");

router.get("/", wrapAsync(async (req, res) => {
    const clubs = await Club.find({});
    res.status(200).json({ clubs });
}));

router.get("/:id", wrapAsync(async (req, res) => { 
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: "Club not found" });
    res.status(200).json({ club });
}));

router.post("/", wrapAsync(async (req, res) => {
    const { name, description, facultyHead } = req.body;

    if (!name || !description || !facultyHead) {
        return res.status(400).json({ message: "Name, description, and faculty head are required." });
    }

    const newClub = new Club({
        name,
        description,
        facultyHead,
    });

    const savedClub = await newClub.save();
    res.status(201).json(savedClub);
}));

router.put("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const updateData = { ...req.body };
    const updatedClub = await Club.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedClub) return res.status(404).json({ message: 'Club not found' });
    res.status(200).json(updatedClub);
}));

router.delete("/:id", wrapAsync(async (req, res) => {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    await Club.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Club deleted successfully' });
}));

router.put("/:id/join", wrapAsync(async (req, res) => {
    const { userId, role } = req.body;
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    club.members.push({ user: userId,role });
    await club.save();
    res.status(200).json({ message: 'User joined the club successfully' });
}));

router.put("/:id/leave", wrapAsync(async (req, res) => {
    const { userId } = req.body;
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    club.members = club.members.filter(member => member.user.toString() !== userId);
    await club.save();
    res.status(200).json({ message: 'User left the club successfully' });
}));

router.post("/:id/addEvent",wrapAsync(async (req,res)=>{
    const {eventDetails}=req.body;
    const event=
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    club.events.push({eventId});
    await club.save();
    res.status(200).json({message: 'Successfully added event'});
}));

router.put("/:id/deleteEvent", wrapAsync(async (req, res) => {
    const { eventId } = req.body;
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    club.events = club.events.filter(event => event.toString() !== eventId);
    const event=await Event.findById(eventId);

    await club.save();
    res.status(200).json({ message: 'Event deleted successfully' });
}));

module.exports = router;