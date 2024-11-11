  import React, { useEffect, useState, useRef } from 'react';
  import './index.css';
  import { Input, Button } from './input';
  import { Navigate, useNavigate } from 'react-router-dom';
  // import Avatar from './assets/react.svg'
  let Avatar = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKJr4BSwx1FgkpTxu82lhPo9dwqnSi8IWaHA&s';

  import { io } from 'socket.io-client'


  function ChatRoom() {
    let [conversations, setConverations] = useState([]);
    let user = JSON.parse(localStorage.getItem("userDetails"));
    // console.log(conversations);
    let [messages, setMessages] = useState({});
    let [text, setText] = useState("");
    let [users, setUser] = useState([]);
    let [socket, setSocket] = useState(null);
    let messageRef = useRef(null)
    let [selectedFile, setSelectedFile] = useState(null);
    let [isReq, setIsReq] = useState(true);
    let [msg, setMsg] = useState({});
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');


    useEffect(() => {
      async function verifyUser() {
        let token = user.token;
        if (token) {
          let res = await fetch('http://localhost:2000/userExist', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: token })
          });

          let result = await res.json();
          // console.log(" 39");
          if (result.message) {
            navigate('/chat');
          }
          else {
            localStorage.clear();
            navigate('/login')
          }

        }
      }
      verifyUser();
    }, [])





    const handleImageClick = (imageSrc) => {
      setSelectedImage(imageSrc);
      setModalOpen(true);
    };

    const closeModal = () => {
      setModalOpen(false);
    };


    // console.log(conversations,"conversation");
    useEffect(() => {
      let fetchUser = async () => {
        try {
          // Fetch all users
          let res = await fetch(`http://localhost:2000/users/${user.id}`);
          let fetchedUsers = await res.json();

          // Fetch conversations
          let res1 = await fetch(`http://localhost:2000/conversation/${user.id}`);
          let fetchedConversations = await res1.json();

          // Extract the emails (or user IDs) of users in conversations
          let conversationUserEmails = fetchedConversations.map(convo => convo.user.email);

          // Filter out users who are already in a conversation
          let availableUsers = fetchedUsers.filter(user => !conversationUserEmails.includes(user.user.email));

          // Set the filtered users to the state
          setUser(availableUsers);
        } catch (error) {
          console.error('Error fetching users or conversations:', error);
        }
      }

      fetchUser();
    }, [user.id]);

    useEffect(() => {
      const newSocket = io('http://localhost:2001');
      setSocket(newSocket);
      console.log('Socket connected:', newSocket);
    }, []);

    useEffect(() => {
      messageRef?.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages.messages])



    useEffect(() => {
      socket?.emit('addUser', user?.id);

      // Listen for incoming messages
      socket?.on('getMessage', data => {
        const isImage = data.isImage; // Check if the message contains an image
        const newMessage = { user: data.user, message: data.message };


        // console.log(data, "57");
        // Update the messages state with the new message
        setMessages(p => ({
          ...p,
          messages: [...p.messages, { user: data.user, message: data.message, isImage: isImage }]
        }))


      });


      // Listen for active users
      socket?.on('getUsers', users => {
        console.log("Active users:", users);
      });
    }, [socket]);
    let [conversationcheck, setConverationcheck] = useState(1)

    useEffect(() => {
      let fetchConversations = async () => {
        let res = await fetch(`http://localhost:2000/conversation/${user.id}`);
        let d = await res.json();
        setConverations(d);
      };
      fetchConversations();
    }, [messages]);




    const fetchMessages = async (Id, user1) => {
      try {
        setConverationcheck(1)
        let res = await fetch(`http://localhost:2000/message/${Id}?senderId=${user?.id}&receiverId=${user1?.receiverId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        let d = await res.json();

        setMessages({ messages: d, reciever: user1, conversationId: Id });

      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };




    const sendMessage = async () => {
      try {
        let formData = new FormData();

        // Append form data
        formData.append('conversationId', messages?.conversationId || null); // If no conversationId, it will be null
        formData.append('senderId', user?.id);
        formData.append('message', text);
        formData.append('receiverId', messages?.reciever?.receiverId || null); // Pass receiverId if no conversationId exists

        // Append file if selected
        if (selectedFile) {
          formData.append('file', selectedFile);
        }


        // Send message and file through fetch API
        let res = await fetch(`http://localhost:2000/message`, {
          method: 'POST',
          body: formData
        });

        let resData = await res.json();
        setMsg(await resData.mesg);

        // Emit message through the socket
        await socket?.emit('sendMessage', {
          conversationId: messages?.conversationId || null,
          senderId: user?.id,
          message: resData.mesg,
          receiverId: messages?.reciever?.receiverId || null,
          isImage: selectedFile ? true : false,
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    };

    // Updated handleSubmit function
    function handleSubmit(e) {

      e.preventDefault();

      sendMessage();

      // reset the form fields
      e.target.reset();
      setText('');
      setSelectedFile(null); // Reset the selected file
      setIsReq(true);

    }

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      setSelectedFile(file); // Store the selected file in state
      setIsReq(false);
    };
    let navigate = useNavigate();
    function userClick() {
      localStorage.clear();
      navigate('/login');
    }








    return (
      <div className="flex h-full w-full border-w">
        <div className="border-2 w-1/4 p-2 h-screen" id='user'>
          <div className="flex m-2">
            <div className="border-blue-400" onClick={() => { userClick(); }}>
              <img src={Avatar} alt="profile" width={60} height={60} className="rounded-full border-blue-400" />
            </div>
            <div className="ml-8">
              <h3 className="text-2xl">{user.name}</h3>
              <p className="text-lg">My account</p>
            </div>
          </div>
          <hr />

          {/* conversation list */}
          <div className="p-2 text-lg ">
            <div className='flex justify-between'>
              <p className="text-blue-400 hover:shadow-lg hover:scale-105 transition-transform transition-shadow duration-300"
                
              >Messages</p>

            </div>
            <div >
              {conversations.map(({ conversationId, user }) => {
                return (
                  <div
                    key={conversationId}
                    className="flex m-2 border-b border-gray-500 py-2 cursor-pointer hover:bg-gray-200 hover:text-blue-500 hover:scale-105 transform transition-all duration-300"
                    onClick={async () => { await fetchMessages(conversationId, user); }}
                  >
                    <div className="border border-blue-400 p-1 rounded-full">
                      <img src={Avatar} alt="profile" width={50} height={50} className="rounded-full" />
                    </div>
                    <div className="ml-10">
                      <h3 className="text-lg">{user.fullName}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                );
              })}
            </div>



          </div>
        </div>



        {/* Center div */}
        {messages.messages ? (
          <div className="h-screen w-1/2 p-4 flex flex-col justify-start items-center">
            <div className="w-3/4 h-16 rounded-[40px] p-1 flex items-center justify-start bg-gray-300">
              <div>
                <img src={Avatar} alt="profile" width={50} height={50} className="rounded-full" />
              </div>
              <div className="ml-10">
                <h3 className="text-lg">{messages.reciever?.fullName}</h3>
                <p className="text-sm text-gray-500">{messages.reciever?.email}</p>
              </div>
            </div>

            {/* Chats */}
            <div className="h-[80%] w-full border-b overflow-y-scroll">
              <div className="h-[100px] py-10 px-10">

                {messages?.messages?.length > 0 &&
                  messages.messages.map(({ message, user: { id } = {}, isImage }, index) => {
                    const isUserMessage = id === user.id;

                    return (
                      <div
                        key={index}
                        className={`cursor-pointer hover:scale-105 transform transition-all duration-300 max-w-[45%] rounded-lg ${isUserMessage ? 'bg-blue-700 text-white ml-auto' : 'bg-gray-300'
                          } p-2 mt-3`}
                      >
                        {isImage ? (
                          <img
                            onClick={() => handleImageClick(`http://localhost:2000/${message}`)}
                            src={`http://localhost:2000/${message}`}
                            alt={message}
                            className="rounded-s max-h-60 border-2 border-green-400"
                          />
                        ) : (
                          message
                        )}

                        <div ref={messageRef}></div>
                      </div>

                    );

                  })}


                {/* Modal for displaying the full-screen image */}
                {isModalOpen && (
                  <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
                    onClick={closeModal} // close modal when background click
                  >
                    <img
                      src={selectedImage}
                      alt="Full Screen"
                      className="max-w-[70%] max-h-[70%] cursor-pointer"
                      onClick={(e) => e.stopPropagation()} // prevent closing 
                    />
                  </div>
                )}


              </div>
            </div>

            {/* Input messages and send button */}
            <div className="flex justify-center  p-4 ">
              <form onSubmit={handleSubmit} className="flex space-x-4 w-[90%]  " >
                <Input
                  type="text"
                  placeholder="Enter your message.."
                  value={text}
                  need={isReq}
                  onChange={(e) => {
                    setText((p) => p = e.target.value);
                    // alert(e.target.value);
                  }}
                  className="h-10 w-[500px] shadow-lg rounded-lg p-2 border-2 border-gray-300 focus:outline-none focus:border-blue-400"
                />
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  placeholder="add image"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label htmlFor="imageUpload" className="cursor-pointer">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex justify-center items-center hover:bg-blue-700 transition-colors duration-300">
                    {/* Icon for file upload */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 10.5l4.5 4.5m0 0l4.5-4.5M12 15V3"
                      />
                    </svg>
                  </div>
                </label>
                <Button
                  name="Send"
                  type="submit"
                  className="w-[200px] rounded-lg bg-blue-600 text-white py-2 hover:bg-blue-700 transition-colors duration-300 "
                />
              </form>
            </div>
          </div>
        ) : (
          <div className="h-screen w-1/2 p-4 flex flex-col justify-center items-center mt-2 text-[40px]">
            No messages
            <br />
            Select Conversation
          </div>
        )}

        {/* last div */}
        <div className="border-2 w-1/4 p-2" id='people'>
          <div className='text-blue-400 text-lg'>People</div>
          <div>
            {users.length > 0 ?
              users.map((user, i) => {
                return (
                  <div
                    key={user.userId}
                    className="flex m-2 border-b border-gray-500 py-2 cursor-pointer hover:bg-gray-200 hover:text-blue-500 hover:scale-105 transform transition-all duration-300"
                    onClick={() => fetchMessages("new", user.user)}
                  >
                    <div className="border border-blue-400 p-1 rounded-full">
                      <img src={Avatar} alt="profile" width={50} height={50} className="rounded-full" />
                    </div>
                    <div className="ml-10">
                      <h3 className="text-lg">{user.user.fullName}</h3>
                      <p className="text-sm text-gray-500">{user.user.email}</p>
                    </div>
                  </div>
                );
              }) : <div className='text-xl text-blue-700 mt-[45%] flex justify-center'>No users</div>}
          </div>
        </div>
      </div>
    );
  }

  export default ChatRoom;
