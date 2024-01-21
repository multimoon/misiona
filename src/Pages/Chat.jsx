import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { otherUserId } = useParams();
  const auth = getAuth();
  const db = getFirestore();
  

  useEffect(() => {
    console.log("Current User ID:", auth.currentUser?.uid);
    console.log("Other User ID:", otherUserId);

    if (auth.currentUser && otherUserId) {
      const messagesRef = collection(db, "messages");
      const q = query(messagesRef, where("chatParticipants", "array-contains", [auth.currentUser.uid, otherUserId].sort()));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const loadedMessages = querySnapshot.docs.map(doc => doc.data());
        console.log("New messages received:", loadedMessages);
        setMessages(loadedMessages);
      });
      

      return () => unsubscribe();
    }
  }, [auth.currentUser, otherUserId, db]);


  const handleSendMessage = async () => {
    if (newMessage.trim() !== '' && auth.currentUser && otherUserId) {
      const messagesRef = collection(db, "messages");
      console.log("Sending message to:", otherUserId);

      try {
        await addDoc(messagesRef, {
          text: newMessage,
          senderId: auth.currentUser.uid,
          receiverId: otherUserId,
          chatParticipants: [auth.currentUser.uid, otherUserId].sort(),
          timestamp: new Date()
        });
        console.log("Message sent:", newMessage);
        setNewMessage('');
      } catch (error) {
        console.error("Error sending message:", error);
      }      
    }
  };
  

  return (
  <div className='chat-scale'>
    <div className="chat-container">
      <div className="messages-container">

        {messages.map((message, index) => (
          <div 
            key={index}
            className={`message ${message.senderId === auth.currentUser.uid ? 'sender' : 'receiver'}`}
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
    </div>
  );
};

export default Chat;
