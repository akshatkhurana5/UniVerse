const mongoose = require('mongoose');
const clubSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image:{
        filename:{type: String},
        url:{type:String},
    },
    description: {
        type: String,
        required: true,
    },
    members: [{ 
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String }
    }],
    facultyHead: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    events: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event' 
    }],
    posts:[{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Post'
    }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const Club = mongoose.model('Club', clubSchema);
module.exports=Club;