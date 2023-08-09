const mongoose = require('mongoose');

const finalSchema = new mongoose.Schema({
  status: String,
  name: String,
  rate: String,
  period: String,
  type: String,
  worked: String,
  totalHours: String,
  ot1: String,
  ot2: String,
  totalEarnings: String,
  finalHours: String,
}, {
  timestamps: true // Add timestamps (createdAt, updatedAt) to the schema
});

const Final = mongoose.model('Final', finalSchema);

module.exports = Final;
