import React from 'react';
import { LoadingState } from '../types';

interface LoaderProps {
  loadingState: LoadingState;
}

const loadingMessages: Record<LoadingState, string> = {
  [LoadingState.IDLE]: '',
  [LoadingState.GENERATING_PLAN]: 'Planning your story and sketches...',
  [LoadingState.GENERATING_IMAGES]: 'Sketching the illustrations...',
  [LoadingState.PLAYING]: 'Telling the story...',
};

const Loader: React.FC<LoaderProps> = ({ loadingState }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <svg className="animate-spin h-10 w-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      <p className="text-xl font-medium text-gray-300">{loadingMessages[loadingState]}</p>
      <p className="text-gray-500">This can take a moment, please be patient.</p>
    </div>
  );
};

export default Loader;