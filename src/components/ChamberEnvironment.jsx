import React, { useMemo } from 'react'
import * as THREE from 'three'
import { CHAMBER_CONFIG } from '../constants/sceneConfig'
import useChamberTextures from '../hooks/useChamberTextures'

/**
 * ChamberEnvironment Component — Phase 2: Procedural Ancient Chamber
 *
 * Replaces the old GLB-based environment with lightweight procedural geometry.
 * Creates a vast, forgotten ancient magical chamber that frames the book + pedestal
 * as the hero composition.
 *
 * Now uses real PBR texture maps (diffuse + normal + roughness) for:
 *   - Walls: Rock Wall 13 texture set
 *   - Arch: Rock Wall 13 texture set (same as walls)
 *   - Columns: Dark Rock texture set
 *   - Ceiling: Rock Wall 13 texture set (reused from walls)
 *
 * Geometry elements (all config-driven from CHAMBER_CONFIG):
 *   - 4 large cylindrical columns with bases and capitals
 *   - 3 distant dark walls (back, left, right)
 *   - 1 large pointed arch silhouette behind the pedestal
 *   - 1 ceiling plane to close the chamber top
 *
 * No GLB loading, no particles, no fog, no bloom, no animations.
 */

// ── Sub-components ───────────────────────────────────────────────────────────

/**
 * Single column with optional base (plinth) and capital.
 * Uses Dark Rock PBR textures with independent repeat values per part.
 */
function Column({ position, config, textureMaterials }) {
  const { radius, height, radialSegments, base, capital } = config

  // Base Y: bottom of column sits at position.y - height/2
  // The position passed in already accounts for height centering
  const baseY = -height / 2 + (base.enabled ? base.height / 2 : 0)
  const capitalY = height / 2 - (capital.enabled ? capital.height / 2 : 0)

  return (
    <group position={position} name="column-group">
      {/* Column shaft */}
      <mesh castShadow receiveShadow name="column-shaft">
        <cylinderGeometry args={[radius, radius * 1.05, height, radialSegments]} />
        <meshStandardMaterial
          {...textureMaterials.shaft}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Base / Plinth */}
      {base.enabled && (
        <mesh
          position={[0, baseY, 0]}
          castShadow
          receiveShadow
          name="column-base"
        >
          <boxGeometry args={[base.width, base.height, base.depth]} />
          <meshStandardMaterial
            {...textureMaterials.base}
            side={THREE.FrontSide}
          />
        </mesh>
      )}

      {/* Capital */}
      {capital.enabled && (
        <mesh
          position={[0, capitalY, 0]}
          castShadow
          receiveShadow
          name="column-capital"
        >
          <boxGeometry args={[capital.width, capital.height, capital.depth]} />
          <meshStandardMaterial
            {...textureMaterials.capital}
            side={THREE.FrontSide}
          />
        </mesh>
      )}
    </group>
  )
}

/**
 * Wall — a simple plane mesh with PBR wall textures.
 */
function Wall({ width, height, position, rotation, materialProps }) {
  return (
    <mesh
      position={position}
      rotation={rotation}
      receiveShadow
      name="chamber-wall"
    >
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial {...materialProps} side={THREE.DoubleSide} />
    </mesh>
  )
}



// ── Main Component ───────────────────────────────────────────────────────────

function ChamberEnvironment() {
  const { columns, walls, arch, ceiling, lighting } = CHAMBER_CONFIG

  // Load all PBR texture sets via shared hook
  const textures = useChamberTextures()

  return (
    <group name="chamber-environment">
      {/* ── Environment Lighting ─────────────────────────────────────── */}
      {/* Subtle cool fills to reveal architecture — separate from SceneLighting */}
      {lighting && (
        <>
          {lighting.ambient && (
            <ambientLight
              color={lighting.ambient.color}
              intensity={lighting.ambient.intensity}
            />
          )}
          {lighting.fills && lighting.fills.map((fill) => (
            <pointLight
              key={fill.name}
              name={fill.name}
              color={fill.color}
              intensity={fill.intensity}
              position={fill.position}
              distance={fill.distance}
              decay={fill.decay}
            />
          ))}
        </>
      )}

      {/* ── Columns ─────────────────────────────────────────────────────── */}
      {columns.positions.map((pos, i) => (
        <Column
          key={`column-${i}`}
          position={pos}
          config={columns}
          textureMaterials={textures.column}
        />
      ))}

      {/* ── Walls ───────────────────────────────────────────────────────── */}
      {/* Back wall — uses backWall repeat */}
      <Wall
        width={walls.back.width}
        height={walls.back.height}
        position={walls.back.position}
        rotation={walls.back.rotation}
        materialProps={textures.wall.backWall}
      />
      {/* Left wall — uses sideWall repeat */}
      <Wall
        width={walls.left.width}
        height={walls.left.height}
        position={walls.left.position}
        rotation={walls.left.rotation}
        materialProps={textures.wall.sideWall}
      />
      {/* Right wall — uses sideWall repeat */}
      <Wall
        width={walls.right.width}
        height={walls.right.height}
        position={walls.right.position}
        rotation={walls.right.rotation}
        materialProps={textures.wall.sideWall}
      />



      {/* ── Ceiling ─────────────────────────────────────────────────────── */}
      {ceiling.enabled && (
        <mesh
          position={ceiling.position}
          rotation={ceiling.rotation}
          receiveShadow
          name="chamber-ceiling"
        >
          <planeGeometry args={[ceiling.size, ceiling.size]} />
          <meshStandardMaterial
            {...textures.wall.ceiling}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  )
}

export default ChamberEnvironment
