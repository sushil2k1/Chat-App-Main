let mongoose=require('mongoose');

let obj={
    members:{type:Array,required:true},
    createdBy:{type:String,required:true},
    name:{type:String,required:true},
    
}

let groupSchema=new mongoose.Schema(obj, { timestamps: true });
let group=mongoose.model('group',groupSchema);
module.exports=group;