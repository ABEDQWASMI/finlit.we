import React from 'react';
import { MessageCircle } from 'lucide-react';

const MessageInput = ({ inputText, setInputText, handleSendMessage }) => (
    <div className="p-4 flex">
        <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-white border border-[#C736D9]/30 p-3 rounded-l-lg focus:outline-none focus:border-[#C736D9]"
            placeholder="Type your message..."
        />
        <button
            onClick={handleSendMessage}
            className="bg-[#C736D9] p-3 rounded-r-lg hover:bg-[#C736D9]/90 transition-colors"
        >
            <MessageCircle size={24} className="text-white" />
        </button>
    </div>
);

export default MessageInput;
