let mongoose=require('mongoose')
let User=require('../model/user');

async function SaveUser(user) {
    const { name, email, contact, password, token } = user;
    
    if (!name || !email || !contact || !password) {
        return { status: 400, message: "Fill all the details" };
    }

    let existingUser = await User.findOne({ username: email });
    if (existingUser) {
        return { status: 409, message: "User already exists" };
    }

    let newUser = await User.create({
        name: name,
        username: email,
        contact: contact,
        password: password,
        token: token || null  
    });

    if (newUser) {
        return { status: 201, message: "User registered successfully" };
    } else {
        return { status: 500, message: "Error registering user" };
    }
}


module.exports=SaveUser;