import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ProgressiveStoryStep, AnimationStyle } from './types';
import { LoadingState } from './types';
import { generateStoryPlan, editImage, getBlankCanvas } from './services/geminiService';
import PromptInput from './components/PromptInput';
import IllustrationDisplay from './components/IllustrationDisplay';
import StoryDisplay from './components/StoryDisplay';
import Loader from './components/Loader';
import { Header } from './components/Header';
import { Footer } from './components/Footer';


const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [storySteps, setStorySteps] = useState<ProgressiveStoryStep[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [currentImageUrl, setImageUrl] = useState<string | null>(null);
  const [currentAnimationStyle, setCurrentAnimationStyle] = useState<AnimationStyle | null>(null);

  const playbackController = useRef({ isPlaying: false });
  const generationController = useRef({ isCancelled: false });


  const resetState = useCallback(() => {
    playbackController.current.isPlaying = false;
    generationController.current.isCancelled = true; // Cancel any ongoing generation
    window.speechSynthesis.cancel();
    setPrompt('');
    setStorySteps([]);
    setLoadingState(LoadingState.IDLE);
    setError(null);
    setCurrentStepIndex(-1);
    setImageUrl(null);
    setCurrentAnimationStyle(null);
  }, []);
  
  const startPlayback = useCallback(async () => {
    if (storySteps.length === 0 || playbackController.current.isPlaying) return;

    playbackController.current.isPlaying = true;

    for (let i = 0; i < storySteps.length; i++) {
      if (!playbackController.current.isPlaying) break;

      setCurrentStepIndex(i);
      const step = storySteps[i];
      if(step.imageData) {
        setImageUrl(`data:image/jpeg;base64,${step.imageData}`);
      }
      setCurrentAnimationStyle(step.animation);
      
      const utterance = new SpeechSynthesisUtterance(step.textToSpeak);
      await new Promise<void>((resolve, reject) => {
           if (!playbackController.current.isPlaying) {
              resolve();
              return;
          }
          utterance.onend = () => resolve();
          utterance.onerror = (e) => {
              setError("A narration error occurred.");
              console.error(e);
              reject(e);
          };
          window.speechSynthesis.speak(utterance);
      });
    }
    
    playbackController.current.isPlaying = false;
    setLoadingState(LoadingState.IDLE);
    if (storySteps.length > 0) {
        setCurrentStepIndex(storySteps.length -1);
    }

  }, [storySteps]);


  useEffect(() => {
    if (loadingState === LoadingState.PLAYING) {
      startPlayback();
    }
  }, [loadingState, startPlayback]);


  useEffect(() => {
    // Cleanup on unmount
    return () => {
      playbackController.current.isPlaying = false;
      if(window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleGenerateStory = async () => {
    if (!prompt.trim()) {
      setError('Please enter a story idea.');
      return;
    }

    // Manually reset state for a new story, but keep the prompt for the API call
    playbackController.current.isPlaying = false;
    generationController.current.isCancelled = false; // Reset cancellation flag
    window.speechSynthesis.cancel();
    setStorySteps([]);
    setImageUrl(null);
    setCurrentStepIndex(-1);
    setError(null);
    setLoadingState(LoadingState.GENERATING_PLAN);

    try {
      // 1. Generate the story plan
      const plan = await generateStoryPlan(prompt);

      if (generationController.current.isCancelled) return;

      if (!plan || plan.length === 0) {
        throw new Error("Story generation failed to return any steps.");
      }
      setStorySteps(plan);
      setLoadingState(LoadingState.GENERATING_IMAGES);

      // 2. Generate all images sequentially
      const stepsWithImages: ProgressiveStoryStep[] = [];
      let currentImageB64 = getBlankCanvas();

      for (const step of plan) {
         if (generationController.current.isCancelled) {
            console.log("Image generation cancelled.");
            return;
         }
         currentImageB64 = await editImage(currentImageB64, step.imageEditPrompt);
         stepsWithImages.push({ ...step, imageData: currentImageB64 });
      }
      
      if (generationController.current.isCancelled) return;
      
      setStorySteps(stepsWithImages);
      setLoadingState(LoadingState.PLAYING);

    } catch (err) {
      console.error(err);
      if (!generationController.current.isCancelled) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred while generating the story.');
          setLoadingState(LoadingState.IDLE);
      }
    }
  };
  
  const isProcessing = loadingState === LoadingState.GENERATING_PLAN || loadingState === LoadingState.GENERATING_IMAGES;
  const isPlaying = loadingState === LoadingState.PLAYING;

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-4 w-full">
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
          
          {isProcessing ? (
            <Loader loadingState={loadingState} />
          ) : currentImageUrl ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <IllustrationDisplay
                imageUrl={currentImageUrl}
                altText={storySteps[currentStepIndex]?.imageEditPrompt}
                animation={currentAnimationStyle}
              />
              <StoryDisplay
                steps={storySteps}
                currentSegmentIndex={currentStepIndex}
              />
            </div>
          ) : (
             <div className="text-center">
                <h2 className="text-3xl font-bold text-indigo-400 mb-2">Welcome to Story Sketcher</h2>
                <p className="text-gray-400 text-lg">Enter a simple idea, and watch a cinematic story unfold.</p>
             </div>
          )}

          <div className="mt-4 w-full flex flex-col items-center">
            {loadingState === LoadingState.IDLE && !currentImageUrl && (
              <PromptInput
                prompt={prompt}
                setPrompt={setPrompt}
                onSubmit={handleGenerateStory}
                isLoading={isProcessing}
              />
            )}
             {loadingState !== LoadingState.GENERATING_PLAN && loadingState !== LoadingState.GENERATING_IMAGES && (
                <button
                    onClick={resetState}
                    className="mt-4 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition-colors duration-200"
                >
                    {isProcessing || isPlaying ? 'Stop & Reset' : 'Create Another Story'}
                </button>
            )}
            {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;