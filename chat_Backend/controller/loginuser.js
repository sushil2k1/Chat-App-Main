let User = require('../model/user');
let {generateJWTToken}=require('./jwtVerify')

async function loginUser(val) {
  const { username, password } = val;

  // Validate input fields
  if (!username || !password) {
    return { status: 400, message: "Please provide both username and password" };
  }

  // Find the user in the database
  let user = await User.findOne({ username: username });

  if (!user) {
    return { status: 404, message: "User not found" };
  }

  if (user.password === password) {
    // Generate JWT token
    const token = generateJWTToken(user);

    // Update user record with the new token
    await User.updateOne({ username: user.username }, { $set: { token } })
      .then(result => {
        console.log('Token update successful');
      })
      .catch(err => {
        console.error('Error updating token', err);
      });

    return { status: 200, message: "Login successful", token };
  } else {
    return { status: 401, message: "Incorrect password" };
  }
}

module.exports = loginUser;
