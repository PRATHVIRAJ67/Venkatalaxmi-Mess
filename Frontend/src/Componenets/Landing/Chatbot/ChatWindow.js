import React from 'react';
import './ChatWindow.css';

const ChatWindow = () => {
    return (
        <div className="chat-window">
            <div className="chat-header">
                Exness Assistant
            </div>
            <div className="chat-body">
                <p>👋 Hi there! I’m Lemon AI Assistant. How can I help you today?</p>
            </div>
            <div className="chat-footer">
                <input type="text" placeholder="Type your message..." />
                <button>Send</button>
            </div>
        </div>
    );
};

export default ChatWindow;
