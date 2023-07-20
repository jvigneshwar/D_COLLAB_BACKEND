const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  imageName: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  rating : {
    type:Number
  },
  ratingCount : {
    type:Number
  },
  Suggestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Suggest'
  }]
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
