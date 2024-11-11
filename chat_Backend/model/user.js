let mongoose = require('mongoose');


let users = {
    name: { type: String, required: true, minlength: 3 },
    username: { type: String, required: true, unique: true, minlength: 5 },
    contact: { type: String, required: true, minlength: 10, maxlength: 15 },
    password: { type: String, required: true, minlength: 8 },
    token:{type:String}

};


let userSchema = new mongoose.Schema(users);

// Create the model
let User = mongoose.model('User', userSchema);

module.exports = User;
