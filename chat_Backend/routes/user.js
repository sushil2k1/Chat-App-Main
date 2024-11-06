const express = require('express');
const app = express.Router();
let loginUser=require('../controller/loginuser');
let SaveUser=require('../controller/saveuser');
let mongoose = require("mongoose");
let User=require('../model/user')

 
app.post("/saveUser", async (req, res) => {
    try {
        // console.log("Request body:", req.body);

        let result = await SaveUser(req.body);

        // Send the appropriate status code and message
        res.status(result.status).send(result.message);

    } catch (error) {
        console.error("Error saving user:", error);
        res.status(500).send("Server error");
    }
});


app.post("/loginUser", async (req, res) => {
    try {
        let result = await loginUser(req.body);

        res.status(result.status).json({ message: result.message });

    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: "Server error" });
    }
});


app.post('/userData', async (req, res) => {
    try {
        let username = req.body.user;
        // console.log(req.body);
        let r = await User.findOne({ username: username });
        // console.log(r);
        res.send({ name: r.name, username: r.username, token: r.token, id: r._id });
    }
    catch (err) {
        console.error("Error", err)
    }
})

app.get('/users/:userId', async (req, res) => {
    try {
        let userId = req.params.userId;
        let users = await User.find({ _id: { $ne: userId } });
        let userData = Promise.all(users.map(async (user) => {
            return {
                user: {
                    email: user.username,
                    fullName: user.name,
                    receiverId: user._id
                }

            }
        }))
        res.status(200).send(await userData);

    }
    catch (err) {
        console.error("Error in fetching users details", err);
    }
}
)

module.exports=app;