
import { animate, AnimationPlaybackControls, spring } from 'motion';

// Define proper spring configuration
const springConfig = { 
  stiffness: 100, 
  damping: 10, 
  mass: 1 
};

// Helper function to safely animate elements
const safeAnimate = (
  element: HTMLElement | null, 
  properties: Record<string, any>, 
  options: Record<string, any>
): AnimationPlaybackControls | null => {
  if (!element) return null;
  return animate(element, properties, options);
};

export const fadeIn = (element: HTMLElement | null, delay: number = 0): AnimationPlaybackControls | null => {
  return safeAnimate(
    element,
    { opacity: [0, 1], y: [20, 0] },
    { delay, duration: 0.6, easing: spring() }
  );
};

export const popIn = (element: HTMLElement | null, delay: number = 0): AnimationPlaybackControls | null => {
  return safeAnimate(
    element,
    { scale: [0.9, 1], opacity: [0, 1] },
    { delay, duration: 0.4, easing: spring() }
  );
};

export const slideInFromBottom = (element: HTMLElement | null, delay: number = 0): AnimationPlaybackControls | null => {
  return safeAnimate(
    element,
    { opacity: [0, 1], y: [20, 0] },
    { delay, duration: 0.5, easing: [0.165, 0.84, 0.44, 1] }
  );
};

export const slideInFromRight = (element: HTMLElement | null, delay: number = 0): AnimationPlaybackControls | null => {
  return safeAnimate(
    element,
    { opacity: [0, 1], x: [20, 0] },
    { delay, duration: 0.5, easing: [0.165, 0.84, 0.44, 1] }
  );
};

export const pulseAnimation = (element: HTMLElement | null): AnimationPlaybackControls | null => {
  return safeAnimate(
    element,
    { scale: [1, 1.02, 1] },
    { duration: 2, repeat: Infinity, easing: [0.25, 0.1, 0.25, 1] }
  );
};
