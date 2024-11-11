import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import Login from './login.jsx';
import ChatRoom from './ChatRoom.jsx';
import { useState,useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'

createRoot(document.getElementById('root')).render(
  
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="login" element={<Login />} />
        <Route path="chat" element={<ChatRoom />} />
      </Routes>
    </BrowserRouter>
 
);


