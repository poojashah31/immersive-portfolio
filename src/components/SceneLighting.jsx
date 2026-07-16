import React from 'react'
import { LIGHTING_CONFIG } from '../constants/sceneConfig'

/**
 * SceneLighting Component
 *
 * Provides the warm, atmospheric candle-like lighting for the intro scene.
 * The intent is to mimic a single torch source illuminating an ancient book
 * in an otherwise near-dark chamber.
 *
 * Three light sources:
 *   1. Ambient — near-black warm fill so shadows aren't pure void
 *   2. Key point light — warm amber/orange above and in front of the book
 *   3. Fill point light — dim warm glow from front-left, preserves shadow depth
 *   4. Rim point light — subtle separation light from behind
 */
function SceneLighting() {
  const { ambient, keyLight, fillLight, rimLight } = LIGHTING_CONFIG

  return (
    <group name="scene-lighting">
      {/* Ambient — barely perceptible warmth in deepest shadows */}
      <ambientLight
        color={ambient.color}
        intensity={ambient.intensity}
      />

      {/* Key Light — primary warm source, casts dramatic shadows */}
      <pointLight
        name="key-light"
        color={keyLight.color}
        intensity={keyLight.intensity}
        position={keyLight.position}
        distance={keyLight.distance}
        decay={keyLight.decay}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.001}
        shadow-camera-near={0.5}
        shadow-camera-far={15}
      />

      {/* Fill Light — secondary dim warm glow from front-left */}
      <pointLight
        name="fill-light"
        color={fillLight.color}
        intensity={fillLight.intensity}
        position={fillLight.position}
        distance={fillLight.distance}
        decay={fillLight.decay}
      />

      {/* Rim Light — subtle edge separation from behind the book */}
      <pointLight
        name="rim-light"
        color={rimLight.color}
        intensity={rimLight.intensity}
        position={rimLight.position}
        distance={rimLight.distance}
        decay={rimLight.decay}
      />
    </group>
  )
}

export default SceneLighting
