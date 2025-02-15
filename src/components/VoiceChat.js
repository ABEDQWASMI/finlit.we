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
        <>
            <Header setCurrentView={setCurrentView} />
            <div className="bg-white h-full w-full flex flex-col items-center justify-start text-black relative overflow-hidden">
                <div className='h-[45%] w-full flex justify-center items-center'>
                    {renderAvatar()}
                </div>

                <div className='h-[45%] flex items-start justify-center px-4'>
                    <p className="text-2xl font-medium text-center max-w-[80%]">
                        {botResponse.split(' ').map((word, index) => (
                            <span key={index} className='text-black'>{word} </span>
                        ))}
                    </p>
                </div>

                <div className="absolute bottom-14 left-0 right-0 flex justify-between items-center px-4">
                    <div className="flex space-x-4">
                        <AvatarSelector 
                            currentAvatar={currentAvatar}
                            onAvatarChange={setCurrentAvatar}
                        />
                    </div>
                    <button 
                        onClick={startListening} 
                        className="p-4 rounded-full" 
                        style={{ background: `url(${micBg})`, backgroundSize: 'cover' }}
                    >
                        {speaking ? <AudioLines size={30} /> : <MicIcon size={30} />}
                    </button>
                    <div className="relative">
                        <button 
                            onClick={toggleLanguages} 
                            className="p-2 rounded-full bg-[#272626]"
                        >
                            <Globe size={24} />
                        </button>
                        {showLanguages && (
                            <div className="absolute bottom-full right-1 mb-2 flex flex-col space-y-2">
                                {['עב', 'عر', 'EN'].map((lang) => (
                                    <button
                                        key={lang}
                                        onClick={() => {
                                            setSelectedLanguage(lang);
                                            setShowLanguages(false);
                                        }}
                                        className={`p-2 rounded-full text-xs flex items-center justify-center ${
                                            selectedLanguage === lang ? 'bg-purple-600' : 'bg-[#272626]'
                                        }`}
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default VoiceChat;
