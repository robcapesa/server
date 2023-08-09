const mongoose = require('mongoose');

const timeSheetsSchema2 = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee', // Reference to the User model (replace 'User' with your actual User model name)
    required: true,
  },
  key: {
    type: String,
    unique:true,
    required: true,
  },
  deductions: {
    type: Number,
    default: 0
  },
  additions: {
    type: Number,
    default: 0
  },
  period: {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  hours:{
    type: Boolean,
    default:false
  },
  notes: 
    {
        type: String,
    },
  status: {
    type: String,
    enum: ['editing', 'pending', 'approved', 'denied'],
    default: 'editing', // Set the default status to 'editing'
    required: true,
  },
}, {
  timestamps: true, // Add timestamps (createdAt, updatedAt) to the schema
});

module.exports = mongoose.model('TimeSheets2', timeSheetsSchema2);
