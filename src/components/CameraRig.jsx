import React from 'react'
import { OrbitControls } from '@react-three/drei'
import useCameraAnimation from '../animations/useCameraAnimation'
import { CAMERA_CONFIG } from '../constants/sceneConfig'

/**
 * CameraRig Component
 *
 * A thin wrapper that activates the cinematic camera dolly animation.
 * After the cinematic animation completes, it enables OrbitControls for inspection.
 */
function CameraRig() {
  // Trigger the GSAP-driven dolly on mount
  const { isAnimating } = useCameraAnimation()
  
  return (
    <>
      {!isAnimating && (
        <OrbitControls 
          target={CAMERA_CONFIG.lookAt}
          minDistance={CAMERA_CONFIG.controls.minDistance}
          maxDistance={CAMERA_CONFIG.controls.maxDistance}
          enablePan={false}
          makeDefault
        />
      )}
    </>
  )
}

export default CameraRig
