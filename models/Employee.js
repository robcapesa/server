// Import necessary modules
const mongoose = require('mongoose');

// Define employee schema
const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  payType: {
    type: String,
    enum: ['weekly', 'hourly'],
    required: true
  },
  payRate: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    default: 0
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  sin: {
    type: String,
    required: true,
    unique: true
  },
  birthday: {
    type: Date,
    required: true
  }
},
{
  timestamps: true // Add timestamps (createdAt, updatedAt) to the schema
}
);

// Create and export the employee model
module.exports = mongoose.model('Employee', employeeSchema);
