const express = require("express");
const router = express.Router();
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const verifyToken = require("../middlewares/authMiddleware");
const wrapAsync = require("../utils/wrapAsync");

// Register
router.post("/signup", wrapAsync(async (req, res) => {
    const { name, email, password, rollNumber, role } = req.body;

    let userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists!" });

    const user = new User({ name, email, password, rollNumber, role });
    await user.save();

    const token = generateToken(user._id);

    res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
    });

    res.status(201).json({ _id: user._id, name, email, rollNumber, role });
}));

// Login
router.post("/login", wrapAsync(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
        const token = generateToken(user._id);

        res.cookie("jwt", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
        });

        res.status(200).json({ _id: user._id, name: user.name, email, rollNumber: user.rollNumber, role: user.role });
    } else {
        res.status(401).json({ message: "Invalid email or password" });
    }
}));

// Logout
router.post("/logout", (req, res) => {
    res.clearCookie("jwt", { httpOnly: true, secure: process.env.NODE_ENV === "production" });
    res.json({ message: "Logged out successfully" });
});

// Get user
router.get("/:id", verifyToken, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id)
        .select("-password")
        .populate("clubs", "name description")
        .populate("posts");

    if (!user) return res.status(404).json({ message: "User not found" });

    const isOwner = req.user._id.toString() === id;

    res.status(200).json({ user, isOwner });
}));

// Edit user
router.put("/:id/edit", verifyToken, isOwner,wrapAsync(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found!" });

    let updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });

    if (req.file) {
        updatedUser.profilePicture = { filename: req.file.filename, url: req.file.path };
        await updatedUser.save();
    }

    res.status(200).json({ updatedUser });
}));

// Delete user
router.delete("/:id/delete", verifyToken, isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted successfully!" });
}));

// Follow user
router.post("/:id/follow/:userId", verifyToken,isOwner, wrapAsync(async (req, res) => {
    const userToFollow = await User.findById(req.params.userId);
    const currUser = await User.findById(req.user._id);

    if (!userToFollow || !currUser) return res.status(404).json({ message: "User not found" });

    if (!currUser.following.includes(userToFollow._id)) {
        currUser.following.push(userToFollow._id);
        userToFollow.followers.push(currUser._id);
        await currUser.save();
        await userToFollow.save();
        return res.status(200).json({ message: "User followed successfully" });
    }

    res.status(400).json({ message: "Already following this user" });
}));

// Unfollow user
router.put("/:id/unfollow/:userId", verifyToken,isOwner, wrapAsync(async (req, res) => {
    const followedUser = await User.findById(req.params.userId);
    const currUser = await User.findById(req.user._id);

    if (!followedUser || !currUser) return res.status(404).json({ message: "User not found" });

    if (currUser.following.includes(followedUser._id)) {
        currUser.following = currUser.following.filter(id => id.toString() !== followedUser._id.toString());
        followedUser.followers = followedUser.followers.filter(id => id.toString() !== currUser._id.toString());

        await currUser.save();
        await followedUser.save();

        return res.status(200).json({ message: "Unfollowed user" });
    }

    res.status(400).json({ message: "You are not following this user" });
}));

// Show followers
router.get("/:id/followers", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).populate("followers", "name profilePicture");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ followers: user.followers });
}));

// Show following
router.get("/:id/following", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).populate("following", "name profilePicture");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ following: user.following });
}));

// Remove follower
router.put("/:id/removefollower/:followerId", verifyToken,isOwner, wrapAsync(async (req, res) => {
    const { id, followerId } = req.params;
    const currUser = await User.findById(id);
    const follower = await User.findById(followerId);

    if (!currUser || !follower) return res.status(404).json({ message: "User not found!" });

    currUser.followers = currUser.followers.filter(uid => uid.toString() !== followerId);
    follower.following = follower.following.filter(uid => uid.toString() !== id);

    await currUser.save();
    await follower.save();

    res.status(200).json({ message: "Follower removed successfully" });
}));

module.exports = router;
