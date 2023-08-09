// Import necessary modules
const mongoose = require('mongoose');

// Define user schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
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
  type: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user', // Set the default status to 'editing'
    required: true,
  },
});

// Create and export the user model
module.exports = mongoose.model('User', userSchema);
