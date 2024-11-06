let jwt = require('jsonwebtoken');

// Function to sign a JWT token
function generateJWTToken(user) {
    return jwt.sign(
      { username: user.username, contact: user.contact },
      "secret", // Secret key (consider moving this to an environment variable)
      { expiresIn: '2h' }
    );
  }
  
  // Function to verify a JWT token
  function verifyJWTToken(token) {
    try {
      const decoded = jwt.verify(token, "secret"); // Verify token using the same secret
      return { valid: true, decoded };
    } catch (err) {
      return { valid: false, error: err.message };
    }
  }

module.exports={verifyJWTToken,generateJWTToken};