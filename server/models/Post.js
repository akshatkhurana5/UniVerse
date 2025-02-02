const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
    content: { 
        type: String, 
        required: true 
    },
    media: [{ 
        filename:{type: String},
        url:{type: String},
    }], // URLs for images/videos
    postedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: 'postedByModel', 
    },
    postedByModel:{
        type: String,
        enum: ['User', 'Club'],
        required: true
    },
    likes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }], // Users who liked the post
    comments: [
        {
            user: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'User' 
            },
            text: { 
                type: String 
            },
            createdAt: { 
                type: Date, 
                default: Date.now 
            }
        }
    ],
    type: { 
        type: String, 
        enum: ['text', 'image', 'video', 'poll'], 
        default: 'text' 
    },
    pollOptions: [
        {
            option: { 
                type: String 
            },
            votes: [{ 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'User' 
            }]
        }
    ],
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});
const Post = mongoose.model('Post', postSchema);
module.exports = Post;
