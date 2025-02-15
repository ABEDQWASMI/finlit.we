import React, { useState, useEffect, useCallback } from 'react';
import micIcon from '../assets/images/mic.svg';
import chatIcon from '../assets/images/chat.svg';
import gameIcon from '../assets/images/game.svg';

export const getIcon = (type) => {
    switch (type) {
        case 'voice':
            return <img src={micIcon} alt="Mic Icon" />;
        case 'chat':
            return <img src={chatIcon} alt="Chat Icon" />;
        case 'game':
            return <img src={gameIcon} alt="Game Icon" />;
        default:
            return <img src={micIcon} alt="Mic Icon" />;
    }
};

export default function History({ setCurrentView }) {
    const [historyItems, setHistoryItems] = useState([]);

    // Function to group the conversations into pairs of (user + bot)
    const groupConversations = (history) => {
        const conversations = [];
        let currentConversation = { userMessage: '', botResponse: '' };

        history.forEach((message) => {
            if (message.category === 'user') {
                currentConversation.userMessage = message.message;
            } else if (message.category === 'bot') {
                currentConversation.botResponse = message.message;
                conversations.push(currentConversation);
                currentConversation = { userMessage: '', botResponse: '' };
            }
        });

        return conversations;
    };

    // Fetch chat history with retry mechanism and AbortController
    const fetchChatHistory = useCallback(async (retryCount = 0) => {
        const controller = new AbortController(); // Create an AbortController instance
        try {
            const response = await fetch('https://leapthelimit-1057493174729.me-west1.run.app/chat-history', {
                signal: controller.signal,
            });
            if (!response.ok) {
                throw new Error('Failed to fetch chat history');
            }
            const data = await response.json();
            const { history } = data;

            if (Array.isArray(history)) {
                const conversations = groupConversations(history);
                setHistoryItems(conversations);
            } else {
                console.error('Unexpected data format:', data);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('Request aborted: ', error);
            } else if (error.message === 'Failed to fetch') {
                if (retryCount < 3) {
                    console.log(`Retrying... (${retryCount + 1}/3)`);
                    setTimeout(() => fetchChatHistory(retryCount + 1), 1000); // Retry after 1 second
                } else {
                    console.error('Error fetching chat history after multiple attempts:', error);
                }
            } else {
                console.error('Error fetching chat history:', error);
            }
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController(); // Create an AbortController instance

        fetchChatHistory();

        return () => {
            controller.abort(); // Cleanup and abort the fetch if the component unmounts
        };
    }, [fetchChatHistory]);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-[#C736D9] text-md font-medium">History</h2>
                <button 
                    onClick={() => setCurrentView('history_list')} 
                    className="text-[#C736D9]/70 text-sm hover:text-[#C736D9] transition-colors"
                >
                    See all
                </button>
            </div>
            <div className="space-y-2">
                {historyItems.slice(0, 2).map((item, index) => (
                    <div key={index} className="bg-white border border-[#C736D9]/20 p-3 rounded-lg flex items-center justify-start space-x-3 hover:border-[#C736D9]/40 transition-colors">
                        <div className="w-6 h-6">
                            {getIcon(item.type)}
                        </div>
                        <span className="text-gray-600 text-xs line-clamp-1">
                            {item.userMessage}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
