const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        require: true,
        unique: true
    },
    userimg:{
        type: String,
    },
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    posts:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
    }]
    
})

module.exports = mongoose.model("user",userSchema);

