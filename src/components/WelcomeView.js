import React from 'react';
import startIcon from '../assets/images/start.svg';
import LogoPoweredBy from './LogoPoweredBy';

const WelcomeView = ({ setCurrentView }) => (
    <div className="flex flex-col h-full bg-white text-black">
        <div className='mb-3 border-b border-[#C736D9]/20'>
            <LogoPoweredBy />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 space-y-8">
            <img src={startIcon} alt="AI Avatar" className="w-24 h-24 border-2 border-[#C736D9] rounded-full p-2" />
            <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold text-[#C736D9]">AI Finance Buddy</h1>
                <p className="text-gray-600">Your personal AI assistant for financial education</p>
            </div>
            <button
                onClick={() => setCurrentView('chat')}
                className="px-8 py-3 bg-[#C736D9] text-white rounded-full font-medium 
                         hover:bg-[#C736D9]/90 transition-colors shadow-lg 
                         hover:shadow-[#C736D9]/20 hover:shadow-xl"
            >
                Start Chat
            </button>
        </div>
    </div>
);

export default WelcomeView;
