import { useEffect, useRef, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import gsap from 'gsap'
import { CAMERA_CONFIG, DOLLY_CONFIG } from '../constants/sceneConfig'

/**
 * useCameraAnimation Hook
 *
 * Performs a slow cinematic dolly (push-in) of the Three.js camera using GSAP.
 *
 * Architecture:
 *   - GSAP animates a plain JS object (proxy) containing x, y, z values
 *   - useFrame reads those values every R3F render tick and applies them to the camera
 *   - This is the correct pattern for GSAP + R3F — never update camera inside
 *     onUpdate because that runs outside R3F's render cycle
 *
 * Returns:
 *   isAnimating — boolean ref, true while the dolly is in progress
 */
function useCameraAnimation() {
  const { camera } = useThree()

  // FLAG TO TEMPORARILY DISABLE ANIMATION
  // Set to true to allow manual camera framing via OrbitControls from start
  const DISABLE_ANIMATION = false

  // The ref that GSAP animates — R3F reads it each frame via useFrame
  const positionRef = useRef({
    x: CAMERA_CONFIG.startPosition[0],
    y: CAMERA_CONFIG.startPosition[1],
    z: CAMERA_CONFIG.startPosition[2],
  })

  const lookAtVec = useRef(new Vector3(...CAMERA_CONFIG.lookAt))
  const [isAnimating, setIsAnimating] = useState(!DISABLE_ANIMATION)
  const isAnimatingRef = useRef(!DISABLE_ANIMATION)
  const tweenRef = useRef(null)

  useEffect(() => {
    const [sx, sy, sz] = CAMERA_CONFIG.startPosition
    const [mx, my, mz] = CAMERA_CONFIG.midPosition
    const [ex, ey, ez] = CAMERA_CONFIG.endPosition

    if (DISABLE_ANIMATION) {
      // Set camera to start position immediately on mount
      camera.position.set(sx, sy, sz)
      camera.lookAt(lookAtVec.current)
      camera.updateProjectionMatrix()
      return
    }

    // Set camera to start position immediately on mount
    camera.position.set(sx, sy, sz)
    camera.lookAt(lookAtVec.current)
    camera.updateProjectionMatrix()

    // Initialize proxy to match start position
    positionRef.current = { x: sx, y: sy, z: sz }

    isAnimatingRef.current = true
    setIsAnimating(true)

    // Create a multi-stage cinematic timeline
    const tl = gsap.timeline({
      delay: DOLLY_CONFIG.delay,
      onComplete: () => {
        isAnimatingRef.current = false
        setIsAnimating(false)
      }
    })

    const halfDuration = DOLLY_CONFIG.duration / 2

    tl.to(positionRef.current, {
      x: mx,
      y: my,
      z: mz,
      duration: halfDuration,
      ease: 'sine.in',
    }).to(positionRef.current, {
      x: ex,
      y: ey,
      z: ez,
      duration: halfDuration,
      ease: 'sine.out',
    })

    tweenRef.current = tl

    return () => {
      if (tweenRef.current) {
        tweenRef.current.kill()
      }
    }
  }, [camera])

  // Apply GSAP proxy values to camera every R3F frame tick
  useFrame(() => {
    if (!isAnimatingRef.current) return
    const { x, y, z } = positionRef.current
    camera.position.set(x, y, z)
    camera.lookAt(lookAtVec.current)
  })

  return { isAnimating }
}

export default useCameraAnimation
