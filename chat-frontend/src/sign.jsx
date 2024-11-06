import React, { useState } from 'react';
import { Input, Button } from './input'; // Assuming Input and Button are properly defined and exported
import { useNavigate } from 'react-router-dom';
import SaveUser from './api/saveUser';

function Sign() {
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    contact: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setUserDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }));
  }

  async function here(e) {
    e.preventDefault(); // Prevent default form submission behavior

    if (userDetails.password !== userDetails.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    let response = await SaveUser(userDetails);

    if (response.success) {
      alert(response.message); // "User registered successfully"
      navigate('/login'); // Redirect to login page on success
    } else {
      alert(response.message); // Handle errors like "Fill all the details", "User already exists"
    }
  }

  function signIn() {
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">WELCOME TO CHATROOM</h1>
      <h2 className="text-2xl text-gray-600 mb-4">Sign-in</h2>
      <form onSubmit={here} className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <Input
          placeholder="Enter your Name"
          type="text"
          name="name"
          value={userDetails.name}
          onChange={handleChange}
          className="mb-4 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
        <Input
          placeholder="Enter your Email"
          type="email"
          name="email"
          value={userDetails.email}
          onChange={handleChange}
          className="mb-4 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
        <Input
          placeholder="Enter your Contact"
          type="number"
          name="contact"
          value={userDetails.contact}
          onChange={handleChange}
          className="mb-4 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
        <Input
          placeholder="Enter your Password"
          type="password"
          name="password"
          value={userDetails.password}
          onChange={handleChange}
          className="mb-4 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
        <Input
          placeholder="Confirm your Password"
          type="password"
          name="confirmPassword"
          value={userDetails.confirmPassword}
          onChange={handleChange}
          className="mb-6 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />

        <Button
          type="submit"
          name="Sign-in"
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300 mb-4"
        />
        <Button
          name="LOGIN"
          onClick={signIn}
          className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors duration-300"
        />
      </form>
    </div>
  );
}

export default Sign;
