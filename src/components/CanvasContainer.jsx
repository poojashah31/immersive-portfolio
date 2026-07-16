import React from 'react'
import { Canvas } from '@react-three/fiber'
import IntroScene from '../scenes/IntroScene'
import { CAMERA_CONFIG, SCENE_CONFIG } from '../constants/sceneConfig'

/**
 * CanvasContainer Component
 *
 * The root Three.js canvas. Configures:
 *   - Camera: perspective, placed at CAMERA_CONFIG.startPosition
 *   - Renderer: shadows, antialiasing, correct color space
 *   - Background: near-black warm tone
 *   - Fog: subtle depth fog
 *
 * Note: OrbitControls are intentionally excluded here.
 * The GSAP camera dolly in CameraRig animates the camera each frame.
 * OrbitControls would fight GSAP by also writing to camera.position every frame,
 * causing jitter or preventing movement.
 * For debugging, use the browser console: window.__camera to inspect position.
 */
function CanvasContainer() {
  return (
    <Canvas
      shadows
      camera={{
        position: CAMERA_CONFIG.startPosition,
        fov: CAMERA_CONFIG.fov,
        near: CAMERA_CONFIG.near,
        far: CAMERA_CONFIG.far,
      }}
      gl={{
        antialias: true,
        alpha: false,
      }}
      onCreated={({ gl, camera }) => {
        // Correct color output for accurate texture rendering
        gl.outputColorSpace = 'srgb'
        // Expose camera to window for dev debugging
        if (import.meta.env.DEV) {
          window.__camera = camera
        }
      }}
    >
      {/* Near-black warm background — matches CSS body background */}
      <color attach="background" args={[SCENE_CONFIG.background]} />

      {/* Subtle depth fog — reinforces the dark chamber atmosphere */}
      <fog
        attach="fog"
        args={[SCENE_CONFIG.fog.color, SCENE_CONFIG.fog.near, SCENE_CONFIG.fog.far]}
      />

      {/* Phase 1 cinematic intro scene */}
      <IntroScene />
    </Canvas>
  )
}

export default CanvasContainer
