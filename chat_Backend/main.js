const express = require("express");
require('dotenv').config();
const app = express();
const cors = require("cors");
let DB = require("./DB");
let User = require("./model/user");
let mongoose = require("mongoose");
let Message = require('./model/message')
let multer = require('multer');
let path = require('path');
// multer
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads'); // Path to save the file
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to make the file name unique
    }
});

const upload = multer({ storage: storage });
app.use(express.static(path.join(__dirname, 'uploads')));
// socket
// asigning port to socket
const io = require('socket.io')(process.env.SOCKET_PORT, {
    cors: {
        origin: 'http://localhost:5173'
    }
});



// socket implementation
let users = []; // To track connected users

io.on('connection', (socket) => {
    console.log("User connected:", socket.id);

    // Handle user addition
    socket.on("addUser", (userId) => {
        const isUserExist = users.find((user) => user.userId === userId);
        if (!isUserExist) {
            const user = { userId, socketId: socket.id };
            users.push(user);
            io.emit('getUsers', users); // Notify all clients about updated user list
        }
    });

    // Handle message sending
    socket.on('sendMessage', async ({ senderId, receiverId, conversationId, message, isImage, imageName }) => {
        console.log("Sending message from socket:", socket.id);
        console.log("60",senderId, receiverId, conversationId, message, isImage);

        // Find both receiver and sender in the connected users list
        let receiver = users.find((user) => user.userId === receiverId);
        let sender = users.find((user) => user.userId === senderId);
        let senderUser = await User.findById(senderId);

        const messageData = {
            senderId, receiverId, message:message?message:"", conversationId,
            user: { id: senderUser._id, fullName: senderUser.name, email: senderUser.username },
            isImage
        };
        console.log("messageData",messageData);


        // If the receiver is online, send the message to both sender and receiver
        if (receiver) {
            io.to(receiver.socketId).to(sender.socketId).emit('getMessage', messageData);
        } else {
            // If receiver is offline, only send it to the sender for now
            io.to(sender.socketId).emit('getMessage', messageData);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        users = users.filter((user) => user.socketId !== socket.id);
        io.emit('getUsers', users); // Notify all clients about updated user list
    });
});



const SaveUser = require("./controller/saveuser");
const loginUser = require("./controller/loginuser");
const conversation = require("./model/conversation");

app.use(cors());
app.use(express.json());




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


let {verifyJWTToken}=require('./controller/jwtVerify');
const { JsonWebTokenError } = require("jsonwebtoken");

app.post('/userExist', (req, res) => {
    try {
      let token = req.body.token;
    //   console.log('Received token:', token);
      let d=verifyJWTToken(token);
    //   console.log(d);
      if(d.error){
        console.log("token expired");
        res.status(400).json({ message: false });
        return;
      }
      else{
          res.status(200).json({ message: true });

      }
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ message: 'Server error' });
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




// message route

app.post('/message', upload.single('file'), async (req, res) => {
    try {
        let { conversationId, senderId, message, receiverId = '' } = req.body;
        // Check for required fields
        if (!senderId || (!message && req.body.isImage)) {
            return res.status(400).send("Please fill all the required fields");
        }
        console.log(req.body);
        // Check if a file is uploaded
        let filePath = '';
        let isImage = false;

        if (req.file) {
            filePath = req.file.filename;
            isImage = true;
            console.log("filepath    198 ",filePath, isImage);
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
        console.log(newMessage, "210");

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
        const conversationId = req.params.conversationId;
        // console.log(req.params);
        // console.log(req.query);

        const checkMessage = async (conversationId) => {
            const messages = await Message.find({ conversationId });
            // console.log("1490", messages);
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


app.get("/", (req, res) => {
    res.send("server for chat app");
});

DB.init()
    .then(() => {
        console.log("Database connected..");
        app.listen(process.env.PORT, () => {
            console.log(`App is running on http://localhost:2000/`);
        });
    })
    .catch((err) => console.log("Database connection failed ", err));




 