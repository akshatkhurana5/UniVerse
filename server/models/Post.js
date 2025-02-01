const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
    content: { 
        type: String, 
        required: true 
    },
    media: [{ 
        type: String 
    }], // URLs for images/videos
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        // required: true 
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
