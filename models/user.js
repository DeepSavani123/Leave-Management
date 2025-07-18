// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
        name: { 
            type: String, 
            required: true 
        },

        email: { 
            type: String, 
            required: true, 
            unique: true 
        },
        
        password: { 
            type: String, 
            required: true 
        },

        gender: {   
            type: String, 
            enum: ['Male', 'Female'] 
        },

        image: { 
            type: String, 
            default: null 
        },

        phone: { 
            type: String, 
            required: true 
        }, 

        address: { 
            type: String, 
            required: true 
        },

    role: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Role',     
    },

}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
