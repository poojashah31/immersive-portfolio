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

  // FLAG TO TEMPORARILY ENABLE LOGGING FOR FRAME SETUP
  const ENABLE_LOGGING = false
  
  const handleEnd = (e) => {
    if (ENABLE_LOGGING && import.meta.env.DEV) {
      const controls = e?.target
      if (controls) {
        const pos = controls.object.position
        const tgt = controls.target
        
        // Helper to round to 3 decimal places without trailing zeros
        const f = (n) => Math.round(n * 1000) / 1000
        
        console.log(`Camera Position: [${f(pos.x)}, ${f(pos.y)}, ${f(pos.z)}]`)
        console.log(`Camera Target: [${f(tgt.x)}, ${f(tgt.y)}, ${f(tgt.z)}]`)
      }
    }
  }

  return (
    <>
      {!isAnimating && (
        <OrbitControls 
          target={CAMERA_CONFIG.lookAt}
          minDistance={CAMERA_CONFIG.controls.minDistance}
          maxDistance={CAMERA_CONFIG.controls.maxDistance}
          enablePan={false}
          makeDefault
          onEnd={handleEnd}
        />
      )}
    </>
  )
}

export default CameraRig
