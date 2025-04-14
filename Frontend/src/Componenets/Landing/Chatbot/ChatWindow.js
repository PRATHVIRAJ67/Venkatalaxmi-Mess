import React, { useState, useRef, useEffect } from 'react';
import './ChatWindow.css';

// Initial test messages
const INITIAL_MESSAGES = [
    { id: 1, text: "👋 Hi there! I'm Lemon AI Assistant. How can I help you today?", isUser: false },
    { id: 2, text: "I want to know about your services.", isUser: true },
    // Generate some test messages
    ...Array.from({ length: 10 }, (_, i) => ({
        id: i + 3,
        text: i % 2 === 0 
            ? `This is test message ${i+1}. Here's some information about our services.` 
            : `That's interesting. Can you tell me more about feature ${i+1}?`,
        isUser: i % 2 !== 0
    }))
];

const ChatWindow = () => {
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [inputText, setInputText] = useState('');
    const [isOpen, setIsOpen] = useState(true);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleInputChange = (e) => {
        setInputText(e.target.value);
    };

    const handleSendMessage = () => {
        if (inputText.trim() === '') return;
        
        // Add user message
        const newUserMessage = {
            id: messages.length + 1,
            text: inputText,
            isUser: true
        };
        
        // Add bot response (simulated)
        const newBotMessage = {
            id: messages.length + 2,
            text: `Thanks for your message: "${inputText}". This is an automated response.`,
            isUser: false
        };
        
        setMessages([...messages, newUserMessage, newBotMessage]);
        setInputText(''); // Clear input field
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };
    
    const handleClose = () => {
        setIsOpen(false);
        // You could add additional logic here, like notifying a parent component
    };
    
    if (!isOpen) {
        return null; // Don't render if closed
    }

    return (
        <div className="chat-window">
            <div className="chat-header">
                <span>Exness Assistant</span>
                <button className="close-button" onClick={handleClose}>×</button>
            </div>
            <div className="chat-body">
                {messages.map(message => (
                    message.isUser ? (
                        <div key={message.id} className="message user-message">
                            <p>{message.text}</p>
                            <img src="/user.png" alt="User" />
                        </div>
                    ) : (
                        <div key={message.id} className="message bot-message">
                            <img src="/chatbot.png" alt="Lemon AI" />
                            <p>{message.text}</p>
                        </div>
                    )
                ))}
                <div ref={messagesEndRef} /> {/* Empty div for scrolling to bottom */}
            </div>
            <div className="chat-footer">
                <input 
                    type="text" 
                    placeholder="Type your message..." 
                    value={inputText}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
};

export default ChatWindow;