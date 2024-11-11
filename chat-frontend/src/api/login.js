import React from 'react';

async function loginUser(val) {
    console.log(val);
    try {
        let response = await fetch('http://localhost:2000/loginUser', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(val)
        });

        let res = await response.json(); // Await the JSON parsing
        // console.log(response.status, res.message);
        saveToLocalstorage(val.username);

        return { status: response.status, message: res.message };
    } catch (error) {
        console.error('Error logging in user:', error);
        return { status: 500, message: 'Internal Server Error' };
    }
}

async function saveToLocalstorage(user) {
    let response = await fetch('http://localhost:2000/userData', {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({user:user})
    });
    let res = await response.json();
    console.log(res);
    localStorage.setItem("userDetails",JSON.stringify(res));
    console.log(res);
}
export default loginUser;
