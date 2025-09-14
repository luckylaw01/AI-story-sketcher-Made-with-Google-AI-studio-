export interface AnimationStyle {
  zoom: number;
  pan: [string, string];
}

export interface ProgressiveStoryStep {
  textToSpeak: string;
  imageEditPrompt: string;
  animation: AnimationStyle;
  imageData?: string;
}

export enum LoadingState {
  IDLE,
  GENERATING_PLAN,
  GENERATING_IMAGES,
  PLAYING,
}