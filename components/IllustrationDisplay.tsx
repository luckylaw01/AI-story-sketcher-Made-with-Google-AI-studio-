import React, { useState, useEffect } from 'react';
import type { AnimationStyle } from '../types';

interface IllustrationDisplayProps {
  imageUrl: string | null;
  altText: string | undefined;
  animation: AnimationStyle | null;
}

const IllustrationDisplay: React.FC<IllustrationDisplayProps> = ({ imageUrl, altText, animation }) => {
  const [primaryImage, setPrimaryImage] = useState<{ url: string | null; key: number }>({ url: null, key: 0 });
  const [secondaryImage, setSecondaryImage] = useState<{ url: string | null; key: number }>({ url: null, key: 1 });
  const [isPrimaryVisible, setIsPrimaryVisible] = useState(true);

  useEffect(() => {
    if (imageUrl) {
      if (isPrimaryVisible) {
        setSecondaryImage({ url: imageUrl, key: secondaryImage.key + 2 });
      } else {
        setPrimaryImage({ url: imageUrl, key: primaryImage.key + 2 });
      }
      setIsPrimaryVisible(!isPrimaryVisible);
    }
  }, [imageUrl]);

  const containerStyle: React.CSSProperties = {
    transform: `scale(${animation?.zoom ?? 1})`,
    transformOrigin: animation?.pan.join(' ') ?? 'center center',
    transition: 'transform 5s ease-in-out',
  };

  const imageBaseClass = 'absolute inset-0 w-full h-full object-cover transition-opacity duration-1000';

  return (
    <div className="relative w-full aspect-square bg-gray-800 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden border-2 border-gray-700">
      {!imageUrl && (
         <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-indigo-500 animate-pulse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
         </div>
      )}
      <div className="absolute inset-0" style={containerStyle}>
        {primaryImage.url && (
            <img
                key={primaryImage.key}
                src={primaryImage.url}
                alt={altText || 'Generated illustration'}
                className={`${imageBaseClass} ${isPrimaryVisible ? 'opacity-100' : 'opacity-0'}`}
            />
        )}
        {secondaryImage.url && (
             <img
                key={secondaryImage.key}
                src={secondaryImage.url}
                alt={altText || 'Generated illustration'}
                className={`${imageBaseClass} ${!isPrimaryVisible ? 'opacity-100' : 'opacity-0'}`}
            />
        )}
      </div>
    </div>
  );
};

export default IllustrationDisplay;