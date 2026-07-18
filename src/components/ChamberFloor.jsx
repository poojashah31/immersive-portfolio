import React from 'react'
import { FLOOR_CONFIG } from '../constants/sceneConfig'

/**
 * ChamberFloor Component — Phase 2: Atmosphere
 *
 * Renders a simple large ground plane beneath the pedestal to establish
 * the floor of the ancient dark chamber.
 *
 * Uses a subtle dark grey/brown rough stone-like material that does not
 * compete visually with the book.
 *
 * All transform values (size, position, rotation) and material properties
 * live in FLOOR_CONFIG (sceneConfig.js) so they can be adjusted without
 * touching this file.
 */
function ChamberFloor() {
  const { size, position, rotation, material } = FLOOR_CONFIG

  return (
    <mesh
      position={position}
      rotation={rotation}
      receiveShadow
      name="chamber-floor"
    >
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial
        color={material.color}
        roughness={material.roughness}
        metalness={material.metalness}
      />
    </mesh>
  )
}

export default ChamberFloor
