
import { animate, AnimationControls, spring } from 'motion';

export const fadeIn = (element: HTMLElement, delay: number = 0): Promise<AnimationControls> => {
  return animate(
    element,
    { opacity: [0, 1], y: [20, 0] },
    { delay, duration: 0.6, easing: spring() }
  );
};

export const popIn = (element: HTMLElement, delay: number = 0): Promise<AnimationControls> => {
  return animate(
    element,
    { scale: [0.9, 1], opacity: [0, 1] },
    { delay, duration: 0.4, easing: spring({ stiffness: 400, damping: 15 }) }
  );
};

export const slideInFromBottom = (element: HTMLElement, delay: number = 0): Promise<AnimationControls> => {
  return animate(
    element,
    { opacity: [0, 1], y: [20, 0] },
    { delay, duration: 0.5, easing: [0.165, 0.84, 0.44, 1] }
  );
};

export const slideInFromRight = (element: HTMLElement, delay: number = 0): Promise<AnimationControls> => {
  return animate(
    element,
    { opacity: [0, 1], x: [20, 0] },
    { delay, duration: 0.5, easing: [0.165, 0.84, 0.44, 1] }
  );
};

export const pulseAnimation = (element: HTMLElement): Promise<AnimationControls> => {
  return animate(
    element,
    { scale: [1, 1.02, 1] },
    { duration: 2, repeat: Infinity, easing: [0.25, 0.1, 0.25, 1] }
  );
};
