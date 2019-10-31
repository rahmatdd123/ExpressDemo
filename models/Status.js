const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
    content: {
      type: String,
      trim: true,
    },
    pUser: {
        type: String,
        trim: true,
      },
    pDate: {
      type: Date,
      trim: true,
    },
  });
  
  module.exports = mongoose.model('Status', statusSchema);