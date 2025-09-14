
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="w-full p-4 flex justify-center items-center border-b border-gray-800">
            <div className="flex items-center gap-3">
                 <svg className="w-8 h-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-9-5.747h18" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 9.879l4.242 4.242m0-4.242l-4.242 4.242" />
                </svg>
                <h1 className="text-2xl font-bold text-white tracking-wider">
                    Gemini Story Sketcher
                </h1>
            </div>
        </header>
    );
};
