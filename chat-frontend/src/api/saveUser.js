import React from 'react';

async function SaveUser(val) {
  console.log(val);

  try {
    let response = await fetch('http://localhost:2000/saveUser', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(val)
    });

    // Check the response status
    if (response.status === 400) {
      console.error("Validation error: Fill all the details");
      return { success: false, message: "Fill all the details" };
    }
    
    if (response.status === 409) {
      console.error("Conflict: User already exists");
      return { success: false, message: "User already exists" };
    }

    if (response.status === 201) {
      console.log("User registered successfully");
      return { success: true, message: "User registered successfully" };
    }

    
    console.error(`Error: ${response.status}`);
    return { success: false, message: `Error: ${response.status}` };

  } catch (error) {
    console.error('Error saving user:', error);
    return { success: false, message: "Server error" };
  }
}

export default SaveUser;
