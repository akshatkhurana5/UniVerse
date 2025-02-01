const clubSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
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
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

export const Club = mongoose.model('Club', clubSchema);
