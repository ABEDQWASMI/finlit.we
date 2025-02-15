import React from 'react';
import micIcon from '../assets/images/mic.svg';
import chatIcon from '../assets/images/chat.svg';
import gameIcon from '../assets/images/game.svg';

const HomeButtons = ({ setCurrentView }) => {
    // Get the public URL for assets
    const getAssetUrl = (path) => {
        const baseUrl = process.env.NODE_ENV === 'production' 
            ? 'https://leapthelimit.github.io/finlit.we'
            : '';
        return `${baseUrl}${path}`;
    };

    return (
        <div className="flex gap-2 mb-8 px-4">
            <button
                className="bg-white border-2 border-[#C736D9] text-[#C736D9] w-[40%] p-3 rounded-2xl flex flex-col items-start justify-between hover:bg-[#C736D9]/5 transition-colors"
                onClick={() => setCurrentView('voice')}
            >
                <img src={micIcon} alt="Mic Icon" className="w-8 h-8" />
                <span className="text-xs font-medium">Talk</span>
            </button>
            <div className='flex-1 w-[60%] gap-2 flex flex-col'>
                <button
                    className="bg-white border-2 border-[#BCD8FA] text-[#2D7DD2] ps-3 py-2 rounded-2xl flex flex-col gap-1.5 items-start justify-between hover:bg-[#BCD8FA]/5 transition-colors"
                    onClick={() => setCurrentView('text')}
                >
                    <img src={chatIcon} alt="Chat Icon" className="w-8 h-8" />
                    <span className="text-xs font-medium">Chat</span>
                </button>
                <button
                    className="bg-white border-2 border-[#9AED66] text-[#66B032] ps-3 py-2 rounded-2xl flex flex-col gap-1.5 items-start justify-between hover:bg-[#9AED66]/5 transition-colors"
                >
                    <img src={gameIcon} alt="Game Icon" className="w-8 h-8" />
                    <span className="text-xs font-medium">Play a game</span>
                </button>
            </div>
        </div>
    );
};

export default HomeButtons;
