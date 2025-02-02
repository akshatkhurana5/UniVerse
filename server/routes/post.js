const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Post = require("../models/Post");

router.get("/", wrapAsync(async (req, res) => {
    const posts = await Post.find().populate("postedBy", "name").sort({ createdAt: -1 });
    res.status(200).json({ posts });
}));

router.get("/:id", wrapAsync(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json({ post });
}));


router.post("/", wrapAsync(async (req, res) => {
    const { postDetails } = req.body;
    const { postedBy, postedByModel } = postDetails;
    if (!['User', 'Club'].includes(postedByModel)) {
        return res.status(400).json({ message: "Invalid postedByModel. Must be 'User' or 'Club'." });
    }
    
    const validPoster = postedByModel === 'User' ? await User.findById(postedBy) : await Club.findById(postedBy);
    if (!validPoster) return res.status(404).json({ message: `${postedByModel} not found.` });
    
    const newPost = new Post({postDetails});
    if (req.files) {
        req.files.forEach(file => {
            post.media.push({ filename: file.filename, url: file.path });
        });
    }
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
}));


router.put("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (req.file) 
        updateData.media = { url: req.file.path };
    const updatedPost = await Post.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedPost) 
        return res.status(404).json({ message: 'Post not found' });
    res.status(200).json(updatedPost);
}));


router.delete("/:id", wrapAsync(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Post deleted successfully' });
}));

router.put("/:id/like", wrapAsync(async (req, res) => {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }
    if (!post.likes.includes(req.body.userId)) {
        post.likes.addToSet(req.body.userId);
    }
    else {
        post.likes.pull(req.body.userId);
        //post.likes = post.likes.filter(id => id !== req.body.userId);
    }
    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
}));

router.post("/:id/comment", wrapAsync(async (req, res) => {
    const { userId, text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text is required." });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    
    post.comments.push({ user: userId, text });
    const updatedPost = await post.save();
    res.status(201).json(updatedPost);
}));



module.exports = router;