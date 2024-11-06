let mongoose = require('mongoose');


let obj = {
    members: { type: Array, required: true }
};


let coversationSchema = new mongoose.Schema(obj);

// Create the model
let conversation = mongoose.model('conversation', coversationSchema);

module.exports = conversation;
