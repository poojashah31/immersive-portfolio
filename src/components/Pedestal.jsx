import React from 'react'
import { PEDESTAL_CONFIG } from '../constants/sceneConfig'

/**
 * Pedestal Component
 *
 * A procedural stone pedestal built from Three.js box geometry.
 * Three sections: wide base slab, narrower column, and top platform.
 *
 * All Y values in PEDESTAL_CONFIG are the center Y of each section.
 * The book rests on top of the platform surface.
 */
function Pedestal() {
  const { base, column, top, material, position } = PEDESTAL_CONFIG

  return (
    <group name="pedestal" position={position}>
      {/* Base slab — wide foundation on the floor */}
      <mesh
        name="pedestal-base"
        position={[0, base.y, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[base.width, base.height, base.depth]} />
        <meshStandardMaterial
          color={material.color}
          roughness={material.roughness}
          metalness={material.metalness}
        />
      </mesh>

      {/* Column — connects base to top */}
      <mesh
        name="pedestal-column"
        position={[0, column.y, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[column.width, column.height, column.depth]} />
        <meshStandardMaterial
          color={material.color}
          roughness={material.roughness}
          metalness={material.metalness}
        />
      </mesh>

      {/* Top platform — the book rests on this surface */}
      <mesh
        name="pedestal-top"
        position={[0, top.y, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[top.width, top.height, top.depth]} />
        <meshStandardMaterial
          color={material.color}
          roughness={material.roughness}
          metalness={material.metalness}
        />
      </mesh>
    </group>
  )
}

export default Pedestal
