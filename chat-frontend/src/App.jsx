import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// import './index.css';

import Login from './login';
import Sign from './sign';
import { json } from 'react-router-dom';

function App() {
  let [user, setUser] = useState({}); 
  console.log(user);

  useEffect(() => {
    const storedUser = checkUserInLocalStorage(); 
    if (storedUser) {
      setUser(storedUser); 
    }
  }, []); 
let navigate=useNavigate();
  useEffect(()=>{
    let token=user.token;
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


  },[user]);

  console.log(user);

  return (
    <>
    {/* <Login> </Login> */}
      <Sign/>
    </>
  );
}

export default App;

const checkUserInLocalStorage = () => {
  const storedUser = JSON.parse(localStorage.getItem("userDetails"));
  if (storedUser) {
    return storedUser; 
  } else {
    console.log("No user found in localStorage.");
    return null; 
  }
};
