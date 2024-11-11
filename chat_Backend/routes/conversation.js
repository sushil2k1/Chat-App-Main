const express = require('express');
const app = express.Router();
const conversation = require("../model/conversation");
let mongoose = require("mongoose");
let User=require('../model/user');


app.post('/conversation', async (req, res) => {
    try {
        const { senderId, recieverId } = req.body;
        let n = await conversation.create({ members: [senderId, recieverId] })
        // console.log(n);
        res.status(200).send('conversation created successfully');
    }
    catch (err) {
        console.log(err);
    }
})



app.get('/conversation/:userId', async (req, res) => {
    try {

        let userId = req.params.userId;
        // console.log(userId);
        let con = await conversation.find({ members: { $in: [userId] } });
        // console.log(con);
        let conversationUserData = Promise.all(con.map(async (c) => {
            const receiverId = await c.members.find((member) => member !== userId);
            let u = await User.findById(receiverId);
            return {
                user: {
                    receiverId: u._id,
                    email: u.username,
                    fullName: u.name
                },
                conversationId: c._id
            }
        }))
        res.status(200).send(await conversationUserData);
    }
    catch (err) {
        console.log("Error occured", err);
    }
})

module.exports=app;