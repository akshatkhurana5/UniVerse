const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    rollNumber: {
        type: String,
        required: true,
        unique: true,
    },
    profilePicture: {
        type: String,
        default: null,
    },
    bio: {
        type: String,
        default: '',
    },
    clubs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club',
    }],
    role: { 
        type: String, 
        enum: ['student', 'faculty', 'club_head'], 
        default: 'student' 
    },
    createdAt: { 
        type: Date,
         default: Date.now 
    }
});

const User=mongoose.model('User',userSchema);
module.exports=User;