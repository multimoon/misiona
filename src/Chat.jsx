import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Chat.css'; // Importera din CSS-fil här

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Navigera tillbaka
  };

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      setMessages([...messages, { text: newMessage, sender: true }]);
      setNewMessage('');
    }
  };

  return (
    <div className="chat-container">
      <button onClick={handleBack} className="back-button-chat">+</button>

      <div className="messages-container">
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`message ${message.sender ? 'sender' : 'receiver'}`}
          >
            {message.text}
          </div>
        ))}
      </div>

      <div className="input-container">
        <input 
          type="text" 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Skriv ett meddelande..."
          className="message-input"
        />
        <button onClick={handleSendMessage} className="send-button">Skicka</button>
      </div>
    </div>
  );
};

export default Chat;
