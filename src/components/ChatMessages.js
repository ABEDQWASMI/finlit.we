import React, { useState, useRef, useEffect } from 'react';
import startIcon from '../assets/images/start.svg';
import { ArrowUp, Mic } from 'lucide-react';
import PoweredBy from './PoweredBy';
import Header from './Header';  // Importing the Header component
import PromptSuggestions from './PromptSuggestions';  // Correct import statement

const ChatMessages = ({ pastConversation = [], setCurrentView, isHistory = false }) => {
    const [messages, setMessages] = useState(pastConversation || []);  // Initialize with pastConversation if provided
    const [inputMessage, setInputMessage] = useState('');
    const [listening, setListening] = useState(false);  // Track if the mic is listening
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const messagesEndRef = useRef(null);
    const serverUrl = 'https://leapthelimit-1057493174729.me-west1.run.app';

    // Scroll to the latest message
    const scrollToBottom = () => {
        if (messages?.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(scrollToBottom, [messages]);

    // Get suggestions when input changes
    useEffect(() => {
        const getSuggestions = async () => {
            // Only fetch suggestions if there's actual input and user is actively typing
            if (inputMessage.trim().length > 2 && !messages.length) {
                try {
                    const response = await fetch(`${serverUrl}/suggest`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            partial_message: inputMessage.trim()
                        }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.suggestions?.length > 0) {
                            setSuggestions(data.suggestions);
                            setShowSuggestions(true);
                        } else {
                            setShowSuggestions(false);
                        }
                    }
                } catch (error) {
                    console.error('Error getting suggestions:', error);
                    setShowSuggestions(false);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };

        const debounceTimer = setTimeout(getSuggestions, 300);
        return () => clearTimeout(debounceTimer);
    }, [inputMessage, messages.length]); // Added messages.length to dependencies

    // Add language detection function
    const detectLanguage = (text) => {
        const arabicRegex = /[\u0600-\u06FF]/;
        const hebrewRegex = /[\u0590-\u05FF]/;
        
        if (arabicRegex.test(text)) {
            return 'ar';
        } else if (hebrewRegex.test(text)) {
            return 'he';
        }
        return 'en';
    };

    // Send message to the server and update state with the response
    const handleSend = async () => {
        if (inputMessage.trim()) {
            setShowSuggestions(false); // Hide suggestions when sending
            setSuggestions([]); // Clear suggestions array
            const newUserMessage = { text: inputMessage, sender: 'user' };
            setMessages([...messages, newUserMessage]);
            setInputMessage('');

            const detectedLanguage = detectLanguage(inputMessage);

            try {
                const response = await fetch(`${serverUrl}/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: inputMessage,
                        language: detectedLanguage
                    }),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                const newFinlixMessage = { 
                    text: data.response, 
                    sender: 'Finlix',
                    language: data.language 
                };
                setMessages((prevMessages) => [...prevMessages, newFinlixMessage]);

                try {
                    // Save the conversation separately
                    await fetch(`${serverUrl}/save-chat-message`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            messages: [
                                { text: inputMessage, sender: 'user' },
                                { text: data.response, sender: 'Finlix' }
                            ]
                        }),
                    });
                } catch (saveError) {
                    console.error('Error saving chat:', saveError);
                    // Continue even if save fails
                }

            } catch (error) {
                console.error('Error in chat API:', error);
                const errorMessage = { 
                    text: 'There was an error processing your request.', 
                    sender: 'Finlix' 
                };
                setMessages((prevMessages) => [...prevMessages, errorMessage]);
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion) => {
        setInputMessage(suggestion);
        setShowSuggestions(false);
    };

    // Speech recognition function
    const startSpeechRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert('Speech recognition is not supported in your browser.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInputMessage(transcript);
        };

        recognition.onerror = (event) => {
            console.error(`Speech recognition error: ${event.error}`);
            alert('An error occurred with speech recognition: ' + event.error);
        };

        recognition.onend = () => {
            setListening(false);
        };

        recognition.start();
        setListening(true);
    };

    return (
        <div className="flex flex-col h-full bg-white text-black">
            {isHistory && <Header setCurrentView={setCurrentView} />}
            <div className='mb-3 border-b border-[#C736D9]/20'>
                <PoweredBy />
            </div>
            
            {/* Main chat container with proper spacing */}
            <div className="flex-1 overflow-y-auto scrollbar-none w-full relative pb-16">
                {/* Suggestions section */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute bottom-full left-0 right-0 bg-white rounded-t-lg p-2 border border-[#C736D9]/30">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                className="w-full text-left px-3 py-2 hover:bg-[#C736D9]/5 rounded text-black transition-colors"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
                
                {/* Messages section */}
                <div className="space-y-2 px-4">
                    {messages.map((message, index) => (
                        <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {message.sender === 'Finlix' && (
                                <div className="w-10 me-2">
                                    <img src={startIcon} alt='startIcon' className="border border-[#C736D9]/20 rounded-full p-1" />
                                </div>
                            )}
                            <div className={`rounded-lg px-3 py-2 max-w-[75%] font-medium ${
                                message.sender === 'user' 
                                    ? 'bg-[#C736D9] text-white rounded-br-none shadow-lg' 
                                    : 'bg-[#E9E9EB] text-black my-1 rounded-bl-none border border-[#C736D9]/20'
                            }`}>
                                <p className="text-sm">{message.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input bar fixed at bottom */}
            <div className="absolute bottom-4 left-0 right-0 px-4">
                {showSuggestions && suggestions.length > 0 && !messages.length && (
                    <div className="mb-2 space-y-1">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                className="w-full text-left px-4 py-2 bg-white border border-[#C736D9]/30 hover:bg-[#C736D9]/5 
                                         rounded-lg text-black text-sm transition-colors"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
                <div className="bg-white rounded-xl p-1 flex items-center border border-[#C736D9]/30 shadow-lg">
                    <button className="p-2" onClick={startSpeechRecognition}>
                        {listening ? (
                            <Mic color='#C736D9' />
                        ) : (
                            <Mic color='#C736D9' className="opacity-50" />
                        )}
                    </button>
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Message..."
                        className="bg-transparent outline-none p-1 text-black placeholder-gray-400 text-sm flex-1"
                    />
                    {inputMessage.trim() && (
                        <button className="bg-[#C736D9] rounded-full p-1 hover:bg-[#C736D9]/90 transition-colors" onClick={handleSend}>
                            <ArrowUp className="text-white" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatMessages;
