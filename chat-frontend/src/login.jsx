import React, { useEffect, useState } from 'react';
import { Input, Button } from './input';
import './login.css';
import loginUser from './api/login';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  let [user, setUser] = useState("");
  let [pass, setPass] = useState("");
  let navigate = useNavigate();
  let [user1,setUser1]=useState({});

  useEffect(() => {
    const storedUser = checkUserInLocalStorage(); 
    if (storedUser) {
      setUser1(storedUser); 
      // console.log(storedUser);
    }
  }, []); 
  useEffect(()=>{
    let token=user1.token;
    // console.log(user1);
    async function verifyUser() {
      if (token) { // Ensure the token exists
        let res = await fetch('http://localhost:2000/userExist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', 
          },
          body: JSON.stringify({ token: token }) 
        });
  
        let result = await res.json();
        if(result.message){
          navigate('/chat');
        }
        console.log(result); 
      }
    }
  
    verifyUser();


  },[user1]);

  function userVal(e) {
    setUser(e.target.value);
  }

  function passVal(e) {
    setPass(e.target.value);
  }

  async function submitUser() {
    if (user.trim() === "") {
      alert("Enter valid Username");
      return;
    }
    if (pass.trim() === "") {
      alert("Enter valid Password");
      return;
    }

    let userDetails = {
      username: user,
      password: pass
    };

    try {
      let r = await log(userDetails);
      if (r.status === 200) {
        alert("Login successful");
        navigate('/chat');
      } else {
        alert("Enter valid Username and Password");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("An error occurred during login. Please try again.");
    }
  }

  function signIn(){
    navigate('/');
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">WELCOME TO CHATROOM</h1>
      <h2 className="text-2xl text-gray-600 mb-4">LOGIN PAGE</h2>

      <Input
        onChange={userVal}
        placeholder="Enter Username"
        type="text"
        className="mb-4 w-80 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
      />
      <Input
        onChange={passVal}
        placeholder="Enter Password"
        type="password"
        className="mb-6 w-80 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
      />

      <Button
        name="Login"
        onClick={submitUser}
        className="w-80 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300 mb-4"
      />
      <Button
        name="Sign-in"
        onClick={signIn}
        className="w-80 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors duration-300"
      />
    </div>
  );
}

async function log(val) {
  return await loginUser(val);
}


const checkUserInLocalStorage = () => {
  const storedUser = JSON.parse(localStorage.getItem("userDetails"));
  if (storedUser) {
    return storedUser; 
  } else {
    console.log("No user found in localStorage.");
    return null; 
  }
};
