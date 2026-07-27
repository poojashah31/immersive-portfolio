/**
 * Shared state for cinematic animations.
 * Allows useFrame hooks in different components to read animation progress
 * without triggering React state updates.
 */
export const animationState = {
  // effectProgress: 0.0 to 1.0, representing the progression of the atmospheric effects (light shaft, dust)
  effectProgress: 0
}
