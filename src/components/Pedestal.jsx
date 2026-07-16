import React, { useEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { Box3, Vector3 } from 'three'
import { PEDESTAL_CONFIG } from '../constants/sceneConfig'

/**
 * Pedestal Component
 *
 * Loads the stylized stone pedestal GLB.
 * After mount, measures the true world-space bounding box and writes
 * all spatial data into PEDESTAL_CONFIG so BookModel can align itself
 * correctly without any hardcoded guesses.
 */
function Pedestal() {
  const { modelPath, position, scale } = PEDESTAL_CONFIG
  const { scene } = useGLTF(modelPath)
  const primitiveRef = useRef()

  useEffect(() => {
    if (!primitiveRef.current) return

    // Enable shadows
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    // Force full world matrix update so Box3 reads correct world coords
    primitiveRef.current.updateWorldMatrix(true, true)

    // Measure the real world-space bounding box
    const bbox = new Box3().setFromObject(primitiveRef.current)
    const center = new Vector3()
    bbox.getCenter(center)

    // Write all spatial data back to the shared config object.
    // BookModel reads these to align the book correctly at runtime.
    PEDESTAL_CONFIG.topSurfaceY = bbox.max.y
    PEDESTAL_CONFIG.centerX    = center.x
    PEDESTAL_CONFIG.centerZ    = center.z
    PEDESTAL_CONFIG.worldWidth = bbox.max.x - bbox.min.x
    PEDESTAL_CONFIG.worldDepth = bbox.max.z - bbox.min.z

    if (import.meta.env.DEV) {
      console.log('[Pedestal] bbox X:', bbox.min.x.toFixed(3), '→', bbox.max.x.toFixed(3))
      console.log('[Pedestal] bbox Y:', bbox.min.y.toFixed(3), '→', bbox.max.y.toFixed(3))
      console.log('[Pedestal] bbox Z:', bbox.min.z.toFixed(3), '→', bbox.max.z.toFixed(3))
      console.log('[Pedestal] centerX:', PEDESTAL_CONFIG.centerX.toFixed(3), 'centerZ:', PEDESTAL_CONFIG.centerZ.toFixed(3))
      console.log('[Pedestal] worldWidth:', PEDESTAL_CONFIG.worldWidth.toFixed(3), 'worldDepth:', PEDESTAL_CONFIG.worldDepth.toFixed(3))
      console.log('[Pedestal] topSurfaceY:', PEDESTAL_CONFIG.topSurfaceY.toFixed(3))
    }
  }, [scene])

  return (
    <primitive
      ref={primitiveRef}
      object={scene}
      position={position}
      scale={scale}
    />
  )
}

// Preload the pedestal model to ensure it's ready quickly
useGLTF.preload(PEDESTAL_CONFIG.modelPath)

export default Pedestal
