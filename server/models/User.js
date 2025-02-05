const mongoose = require('mongoose');
const bcrypt=require("bcryptjs");
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
        filename:{type: String},
        url:{type: String,
             default:"https://cdn-icons-png.flaticon.com/512/149/149071.png"},
    },
    bio: {
        type: String,
        default: '',
    },
    posts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Post',
    }],
    clubs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club',
    }],
    followers: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    following: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    role: { 
        type: String, 
        enum: ['student', 'faculty', 'club_head'], 
        default: 'student' 
    },
    authrole:{
        type:String,
        default: 'user'
    },
    createdAt: { 
        type: Date,
         default: Date.now 
    }
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


const User=mongoose.model('User',userSchema);
module.exports=User;