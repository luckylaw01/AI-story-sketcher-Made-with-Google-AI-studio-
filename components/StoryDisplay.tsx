import React from 'react';
import type { ProgressiveStoryStep } from '../types';

interface StoryDisplayProps {
  steps: ProgressiveStoryStep[];
  currentSegmentIndex: number;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ steps, currentSegmentIndex }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 h-full max-h-[50vh] md:max-h-full overflow-y-auto">
      <div className="space-y-4 text-lg text-gray-300 leading-relaxed">
        {steps.map((step, index) => (
          <p
            key={index}
            className={`transition-all duration-500 ${
              index === currentSegmentIndex
                ? 'text-white font-semibold opacity-100'
                : 'text-gray-400 opacity-60'
            }`}
          >
            {step.textToSpeak}
          </p>
        ))}
      </div>
    </div>
  );
};

export default StoryDisplay;
