import React from 'react';
import startIcon from '../assets/images/start.svg';
import LogoPoweredBy from './LogoPoweredBy';

const WelcomeView = ({ setCurrentView }) => (
    <div className="h-full flex flex-col justify-between">
        <LogoPoweredBy />
        
        <div className="flex-1 flex flex-col items-center justify-center -mt-8">
            <div className="text-center mb-8">
                <p className="text-black text-base mb-4">
                    Your AI Finance Buddy
                </p>
                <h1 className="text-5xl font-bold tracking-tight">
                    Hey there!<br />
                    I'm Finlix!
                </h1>
                <p className="text-black text-sm">
                    Beta
                </p>
            </div>
            
            <div className="flex-1 flex items-center justify-center">
                <img
                    src={startIcon}
                    alt="loading"
                    className="h-40 w-auto"
                />
            </div>
        </div>

        <div className="pb-4 px-4">
            <button
                className="bg-[#C736D9] text-white py-3 rounded-xl text-base font-medium w-full"
                onClick={() => setCurrentView('home')}
            >
                Get Started
            </button>
        </div>
    </div>
);

export default WelcomeView;
