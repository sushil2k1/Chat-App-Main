let mongoose=require('mongoose');
module.exports.init=async function () {
    await mongoose.connect(MONGO_URL)
    
}
