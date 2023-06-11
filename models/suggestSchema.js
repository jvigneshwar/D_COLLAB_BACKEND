const mongoose = require('mongoose');

const suggestSchema = new mongoose.Schema({
  suggestBody: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  rectangle:[]
});

const Suggest = mongoose.model('Suggest', suggestSchema);

module.exports = Suggest;