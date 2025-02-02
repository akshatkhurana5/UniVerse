const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Club = require("../models/Club");
const Event = require("../models/Event");
const Post=require("../models/Post");
// Get all clubs
router.get("/", wrapAsync(async (req, res) => {
    const clubs = await Club.find({});
    res.status(200).json({ clubs });
}));

// Get a specific club
router.get("/:id", wrapAsync(async (req, res) => {
    const club = await Club.findById(req.params.id)
        .populate("members.user", "name email")
        .populate("facultyHead", "name email")
        .populate("events", "name date location")
        .populate({
            path: "posts",
            populate: { 
                path: "createdBy",
                select: "name"
            }
        });
        

    if (!club) return res.status(404).json({ message: "Club not found" });

    res.status(200).json({ club });
}));

// Create a new club
router.post("/", wrapAsync(async (req, res) => {
    const { clubDetails } = req.body;
    const { facultyHead } = clubDetails;

    const newClub = new Club({
        ...clubDetails,
        members: [{ user: facultyHead, role: "Faculty Head" }],
    });

    if (req.file) {
        newClub.image = { filename: req.file.filename, url: req.file.path };
    }

    const savedClub = await newClub.save();
    res.status(201).json(savedClub);
}));

// Update club details
router.put("/:id", wrapAsync(async (req, res) => {
    let updatedClub = await Club.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedClub) return res.status(404).json({ message: "Club not found" });

    if (req.file) {
        updatedClub.image = { filename: req.file.filename, url: req.file.path };
        await updatedClub.save();
    }

    res.status(200).json(updatedClub);
}));

// Delete a club
router.delete("/:id", wrapAsync(async (req, res) => {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: "Club not found" });

    await Club.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Club deleted successfully" });
}));

// Join a club
router.put("/:id/join", wrapAsync(async (req, res) => {
    const { userId, role } = req.body;
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: "Club not found" });

    // Check if user already a member
    const isMember = club.members.some(member => member.user.toString() === userId);
    if (isMember) return res.status(400).json({ message: "User is already a member" });

    club.members.push({ user: userId, role: role || "Member" });
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

// Get all events by a specific club
router.get("/:id/events", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const events = await Event.find({ createdBy: id, createdByModel: "Club" })
        .populate("createdBy", "name");

    res.status(200).json({ events });
}));


router.get("/:id/posts", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const posts = await Post.find({ createdBy: id, createdByModel: "Club" })
        .populate("createdBy", "name");

    res.status(200).json({ posts });
}));



module.exports = router;
