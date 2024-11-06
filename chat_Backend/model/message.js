let mongoose = require('mongoose');


let obj = {
    conversationId: { type: String },
    senderId: { type: String },
    message: { type: String},
    isImage:{type:Boolean}

};


let messageSchema = new mongoose.Schema(obj);

// Create the model
let Message = mongoose.model('message', messageSchema);

module.exports = Message;
