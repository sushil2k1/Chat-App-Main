const express = require('express');
const app = express.Router();
const conversation = require("../model/conversation");
const Message = require("../model/conversation");
const User = require("../model/user");


let multer = require('multer');
let path = require('path');
// multer
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads'); // path to save the file
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // pppend timestamp to make the file name unique
    }
});
const upload = multer({ storage: storage });
app.use(express.static(path.join(__dirname, 'uploads')));




app.post('/message', upload.single('file'), async (req, res) => {
    try {
        console.log("i am message");
        let { conversationId, senderId, message, receiverId = '' } = req.body;
        // Check for required fields
        if (!senderId || (!message && req.body.isImage)) {
            return res.status(400).send("Please fill all the required fields");
        }
        // console.log(req.body);
        // Check if a file is uploaded
        let filePath = '';
        let isImage = false;

        if (req.file) {
            filePath = req.file.filename;
            isImage = true;
            // console.log("filepath    198 ",filePath, isImage);
        }

        // If new conversation, create a new conversation and message
        if (conversationId === 'new' && receiverId) {
            let newConversation = await conversation.create({ members: [senderId, receiverId] });
            let newMessage = await Message.create({
                conversationId: newConversation._id,
                senderId: senderId,
                message: isImage ? filePath : message,
                isImage: isImage
            });
            // return res.status(200).send("Message sent successfully");
            res.status(200).send({ mesg: newMessage?.message, isImage: newMessage?.isImage });

        }

        // Check for existing conversation or receiver ID
        if (!conversationId && !receiverId) {
            return res.status(400).send("Receiver ID and conversation ID are not available");
        }

        // Create a new message in the existing conversation
        let newMessage = await Message.create({
            conversationId,
            senderId,
            message: isImage ? filePath : message,
            isImage: isImage
        });
        // console.log(newMessage, "210");

        res.status(200).send({ mesg: newMessage?.message, isImage: newMessage?.isImage });

    } catch (err) {
        console.error("Error occurred while saving message:", err);
        if (!res.headersSent) {
            res.status(500).send("Server error");
        }
    }
});


app.get('/message/:conversationId', async (req, res) => {
    try {
        console.log("i am message");

        const conversationId = req.params.conversationId;
        console.log(req.params);
        console.log(req.query);

        const checkMessage = async (conversationId) => {
            const messages = await Message.find({ conversationId });
            console.log("1490", messages);
            const messageUserData = await Promise.all(messages.map(async (message) => {
                const senderId = message.senderId;
                // find the user by senderId
                const user = await User.findById(senderId);
                // Return the user data and message content
                return {
                    user: {
                        email: user.username,
                        fullName: user.name,
                        id: user._id
                    },
                    message: message.message,
                    conversationId: conversationId,
                    isImage: message.isImage

                };
            }));
            console.log(messageUserData);
            // Send the resolved data back in the response
            res.status(200).send(messageUserData);
        }

        if (conversationId === 'new') {
            const checkConversation = await conversation.find({ members: { $all: [req.query.senderId, req.query.receiverId] } });
            if (checkConversation.length > 0) {
                checkMessage(checkConversation[0]._id);
            }
            else {
                return res.status(200).json([]);
            }
        }
        else {
            checkMessage(conversationId);
        }
    } catch (err) {
        console.log("Error occurred", err);
        res.status(500).send("Server error");
    }
});


module.exports=app;