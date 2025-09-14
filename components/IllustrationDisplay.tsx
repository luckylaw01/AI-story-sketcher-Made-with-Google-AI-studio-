import React from 'react';
import type { AnimationStyle } from '../types';

interface IllustrationDisplayProps {
  imageUrl: string | null;
  altText: string | undefined;
  animation: AnimationStyle | null;
}

const IllustrationDisplay: React.FC<IllustrationDisplayProps> = ({ imageUrl, altText, animation }) => {
  const imageStyle: React.CSSProperties = {
    transform: `scale(${animation?.zoom ?? 1})`,
    transformOrigin: animation?.pan.join(' ') ?? 'center center',
    transition: 'transform 5s ease-in-out, opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return (
    <div className="w-full aspect-square bg-gray-800 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden border-2 border-gray-700">
      {!imageUrl ? (
         <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-indigo-500 animate-pulse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
         </div>
      ) : (
        <img
          key={imageUrl} // Re-triggers fade-in on new image
          src={imageUrl}
          alt={altText || 'Generated illustration'}
          className="w-full h-full object-cover animate-fade-in"
          style={imageStyle}
        />
      )}
      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 1.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
};

export default IllustrationDisplay;