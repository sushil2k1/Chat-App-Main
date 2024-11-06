import React from 'react'
// let sql = require('mysql')
import {sql} from 'mysql'
let con=sql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "chat"
});

function SaveUser(user) {
    console.log(user,"From saveUser");
  con.connect((err)=>{
    if(err){
        return console.log("Database not connected");
    }
    else{
        console.log("Database Connected");
    }
  })
  con.query(`INSERT INTO chat (name, email, mobile, password) 
VALUES (${user.name},${user.email},${user.mobile},${user.password});
`)
}

export default SaveUser