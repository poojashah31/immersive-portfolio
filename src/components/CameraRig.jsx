import React from 'react'
import useCameraAnimation from '../animations/useCameraAnimation'

/**
 * CameraRig Component
 *
 * A thin wrapper that activates the cinematic camera dolly animation.
 * Must live inside the R3F Canvas so it has access to useThree().
 * Renders nothing — it is purely a logic component.
 */
function CameraRig() {
  // Trigger the GSAP-driven dolly on mount
  useCameraAnimation()
  return null
}

export default CameraRig
