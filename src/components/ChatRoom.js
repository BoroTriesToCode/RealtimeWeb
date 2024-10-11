import React, { useState, useEffect } from 'react';
import socket from '../socket';
import './custom.css';

const ChatRoom = ({ username, room }) => {
  const friendId = room.split('/')[1];
  const chatRoomId = [username, friendId].sort().join('-'); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {

    // Get previously sent messages in chat
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages/${chatRoomId}`);
        const messages = await response.json();
        setMessages(messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    // Listen for incoming new messages
    socket.on('receiveMessage', (message) => {
      if (message.chatRoomId === chatRoomId) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [chatRoomId]);

  const sendMessage = () => {
    const message = {
      chatRoomId,
      sender: username,
      message: newMessage,
      timestamp: new Date().toISOString()
    };
    socket.emit('sendMessage', message);
    setNewMessage('');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="chat-container">
      <h2>Chat with {friendId}</h2>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={msg.sender === username ? 'my-message' : 'friend-message'}>
            <div className="message-bubble">
              <strong>{msg.sender === username ? 'You' : friendId}</strong>: {msg.message}
              <span className="timestamp">{formatTime(msg.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatRoom;