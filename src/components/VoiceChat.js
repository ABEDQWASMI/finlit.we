import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AudioLines, Globe, MicIcon, Users } from 'lucide-react';
import Header from './Header';
import micBg from '../assets/images/circleDiv.svg';
import FoxAvatar from './FoxAvatar';
import AvatarSelector from './AvatarSelector';
import CatAvatar from './CatAvatar';
import RobotAvatar from './RobotAvatar';
import MouseAvatar from './MouseAvatar';

const VoiceChat = ({ setCurrentView }) => {
    const [speaking, setSpeaking] = useState(false);
    const [showLanguages, setShowLanguages] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('EN');
    const [botResponse, setBotResponse] = useState('What do you know about Finance?');
    const [responseWords, setResponseWords] = useState([]);  
    const [currentWordIndex, setCurrentWordIndex] = useState(0); 
    const recognitionRef = useRef(null); 
    const audioInstanceRef = useRef(null); 
    const serverUrl = 'https://leapthelimit-1057493174729.me-west1.run.app'; 
    const wordsPerBatch = 7;  
    const responseUpdateInterval = 2500;  
    const [audioPlaying, setAudioPlaying] = useState(false);
    const [currentAvatar, setCurrentAvatar] = useState('fox');
    const [isListening, setIsListening] = useState(false);

    // Set up speech recognition (webkitSpeechRecognition for Chrome)
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = selectedLanguage === 'EN' ? 'en-US' : selectedLanguage === 'عر' ? 'ar-SA' : 'he-IL';

            recognition.onstart = () => {
                if (audioInstanceRef.current) {
                    audioInstanceRef.current.pause();
                    audioInstanceRef.current = null;
                }
                setIsListening(true);
                setSpeaking(false);
                setBotResponse('Listening...');
                document.querySelectorAll('.circle').forEach(circle => {
                    circle.classList.add('circle-listening');
                });
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error', event);
                setBotResponse('Error occurred while listening.');
                document.querySelectorAll('.circle').forEach(circle => {
                    circle.classList.remove('circle-listening');
                });
                setSpeaking(false);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
                setSpeaking(false);
                setBotResponse('Generating...');
                document.querySelectorAll('.circle').forEach(circle => {
                    circle.classList.remove('circle-listening');
                });
            };

            recognition.onresult = async (event) => {
                const transcript = event.results[0][0].transcript;
                setBotResponse('');
                await handleUserMessage(transcript);
            };

            recognitionRef.current = recognition;
        } else {
            alert('Speech recognition is not supported in this browser. Please use Google Chrome.');
        }
    }, [selectedLanguage]);

    const startListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.start();
            setBotResponse('Listening...');
        }
    };

    const toggleLanguages = () => {
        setShowLanguages(!showLanguages);
    };

    const getLanguageCode = () => {
        switch(selectedLanguage) {
            case 'עב':
                return 'he-IL';
            case 'عر':
                return 'ar-SA';
            case 'EN':
            default:
                return 'en-US';
        }
    };

    const handleUserMessage = useCallback(async (message) => {
        try {
            const chatResponse = await fetch(`${serverUrl}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message, 
                    language: getLanguageCode()
                })
            });
            const chatData = await chatResponse.json();
            const botReply = chatData.response;

            await fetch(`${serverUrl}/save-chat-message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message, category: 'user'
                })
            });

            await fetch(`${serverUrl}/save-chat-message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: botReply, category: 'bot'
                })
            });

            // Get voice based on avatar
            const getVoiceForAvatar = () => {
                switch(currentAvatar) {
                    case 'robot':
                        return 'en-US-Standard-B'; // More robotic male voice
                    case 'cat':
                        return 'en-US-Standard-E'; // Higher pitched female voice
                    case 'fox':
                    default:
                        return 'en-US-Standard-C'; // Neutral female voice
                }
            };

            const ttsResponse = await fetch(`${serverUrl}/synthesize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    text: botReply, 
                    language_code: getLanguageCode(),
                    voice_name: getVoiceForAvatar(),
                    speaking_rate: currentAvatar === 'robot' ? 0.9 : 1.0,
                    pitch: currentAvatar === 'robot' ? 0.5 : 
                           currentAvatar === 'cat' ? 1.2 : 1.0
                })
            });
            const ttsData = await ttsResponse.json();
            const audioContent = ttsData.audioContent;

            setResponseWords(botReply.split(' '));  
            setCurrentWordIndex(0);  

            if (audioInstanceRef.current) {
                audioInstanceRef.current.pause();
            }
            audioInstanceRef.current = new Audio(`data:audio/mp3;base64,${audioContent}`);
            
            audioInstanceRef.current.onplay = () => {
                setAudioPlaying(true);
                setSpeaking(true);
            };
            
            audioInstanceRef.current.onended = () => {
                setAudioPlaying(false);
                setSpeaking(false);
            };
            
            audioInstanceRef.current.play();
        } catch (error) {
            console.error('Error:', error);
            setBotResponse('Error occurred while processing your message.');
            setSpeaking(false);
            setAudioPlaying(false);
        }
    }, [getLanguageCode, serverUrl, currentAvatar]);

    useEffect(() => {
        if (responseWords.length > 0 && currentWordIndex < responseWords.length) {
            const timer = setTimeout(() => {
                const wordsToShow = responseWords.slice(currentWordIndex, currentWordIndex + wordsPerBatch).join(' ');
                setBotResponse(wordsToShow); 
                setCurrentWordIndex((prevIndex) => prevIndex + wordsPerBatch);
            }, responseUpdateInterval);

            return () => clearTimeout(timer);
        }
    }, [currentWordIndex, responseWords, handleUserMessage, wordsPerBatch, responseUpdateInterval]);

    // Add effect to handle avatar changes
    useEffect(() => {
        // Stop current audio when avatar changes
        if (audioInstanceRef.current) {
            audioInstanceRef.current.pause();
            audioInstanceRef.current = null;
        }
        setAudioPlaying(false);
        setSpeaking(false);
        setBotResponse('What do you know about Finance?');
    }, [currentAvatar]);

    const renderAvatar = () => {
        switch(currentAvatar) {
            case 'robot':
                return <RobotAvatar 
                    isSpeaking={speaking || audioPlaying} 
                    isListening={isListening}
                />;
            case 'cat':
                return <CatAvatar 
                    isSpeaking={speaking || audioPlaying} 
                    isListening={isListening}
                />;
            case 'mouse':
                return <MouseAvatar 
                    isSpeaking={speaking || audioPlaying} 
                    isListening={isListening}
                />;
            case 'fox':
            default:
                return <FoxAvatar 
                    isSpeaking={speaking || audioPlaying} 
                    isListening={isListening}
                />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-white text-black">
            <div className='mb-3 border-b border-[#C736D9]/20'>
                <PoweredBy />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center px-4 space-y-6">
                <div className="relative">
                    <img 
                        src={startIcon} 
                        alt="AI Avatar" 
                        className="w-24 h-24 border-2 border-[#C736D9] rounded-full p-2"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center
                        ${isListening ? 'bg-[#C736D9]' : 'bg-gray-200 border border-[#C736D9]/30'}`}>
                        <MicIcon size={16} className={`text-white ${isListening ? '' : 'text-[#C736D9]'}`} />
                    </div>
                </div>
                
                <div className="text-center space-y-2">
                    <h2 className="text-lg font-semibold">
                        {isListening ? "I'm listening..." : "Press the mic to start"}
                    </h2>
                    <p className="text-sm text-gray-600">
                        {isListening ? "Speak clearly into your microphone" : "Tap the microphone to begin your conversation"}
                    </p>
                </div>

                <button
                    onClick={startListening}
                    className={`px-6 py-3 rounded-full font-medium transition-all
                        ${isListening 
                            ? 'bg-red-500 text-white hover:bg-red-600' 
                            : 'bg-white text-[#C736D9] border-2 border-[#C736D9] hover:bg-[#C736D9] hover:text-white'
                        }`}
                >
                    {isListening ? 'Stop' : 'Start'}
                </button>

                {botResponse && (
                    <div className="w-full max-w-md">
                        <div className="bg-[#E9E9EB] p-4 rounded-lg border border-[#C736D9]/20">
                            <p className="text-sm">{botResponse}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceChat;
