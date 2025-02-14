import React from 'react';
import micIcon from '../assets/images/mic.svg'
import chatIcon from '../assets/images/chat.svg'
import gameIcon from '../assets/images/game.svg'

const HomeButtons = ({ setCurrentView }) => (
    <div className="flex gap-2 mb-8 px-4">
        <button
            className="bg-[#C736D9] text-black w-[40%] p-3 rounded-2xl flex flex-col items-start justify-between"
            onClick={() => setCurrentView('voice')}
        >
            <img src={micIcon} alt="Mic Icon" className="w-8 h-8" />
            <span className="text-xs font-medium">Talk</span>
        </button>
        <div className='flex-1 w-[60%] gap-2 flex flex-col'>
            <button
                className="bg-[#BCD8FA] text-black ps-3 py-2 rounded-2xl flex flex-col gap-1.5 items-start justify-between"
                onClick={() => setCurrentView('text')}
            >
                <img src={chatIcon} alt="Chat Icon" className="w-8 h-8" />
                <span className="text-xs font-medium">Chat</span>
            </button>
            <button
                className="bg-[#9AED66] text-black ps-3 py-2 rounded-2xl flex flex-col gap-1.5 items-start justify-between"
            >
                <img src={gameIcon} alt="Game Icon" className="w-8 h-8" />
                <span className="text-xs font-medium">Play a game</span>
            </button>
        </div>

    </div>

);

export default HomeButtons;
