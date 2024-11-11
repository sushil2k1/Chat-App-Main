require('dotenv').config();

let mongoose=require('mongoose');
module.exports.init=async function () {
    await mongoose.connect(`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.d8d2gtv.mongodb.net/chat-app?retryWrites=true&w=majority&appName=Cluster0`)
    
}