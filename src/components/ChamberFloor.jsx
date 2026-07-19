import React from 'react'
import * as THREE from 'three'
import { FLOOR_CONFIG } from '../constants/sceneConfig'
import useChamberTextures from '../hooks/useChamberTextures'

/**
 * ChamberFloor Component — Phase 2: Atmosphere
 *
 * Renders a large ground plane beneath the pedestal to establish
 * the floor of the ancient dark chamber.
 *
 * Now uses Red Sandstone Tiles PBR textures (diffuse + normal + roughness)
 * loaded via the shared useChamberTextures hook.
 *
 * All transform values (size, position, rotation) live in FLOOR_CONFIG
 * (sceneConfig.js). Texture paths and repeat values live in CHAMBER_TEXTURES.
 */
function ChamberFloor() {
  const { size, position, rotation } = FLOOR_CONFIG

  // Load PBR textures via shared hook
  const textures = useChamberTextures()

  return (
    <mesh
      position={position}
      rotation={rotation}
      receiveShadow
      name="chamber-floor"
    >
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial
        {...textures.floor}
        side={THREE.FrontSide}
      />
    </mesh>
  )
}

export default ChamberFloor
