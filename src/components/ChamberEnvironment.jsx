import React, { useMemo } from 'react'
import * as THREE from 'three'
import { CHAMBER_CONFIG } from '../constants/sceneConfig'

/**
 * ChamberEnvironment Component — Phase 2: Procedural Ancient Chamber
 *
 * Replaces the old GLB-based environment with lightweight procedural geometry.
 * Creates a vast, forgotten ancient magical chamber that frames the book + pedestal
 * as the hero composition. All architecture mostly disappears into shadow.
 *
 * Geometry elements (all config-driven from CHAMBER_CONFIG):
 *   - 4 large cylindrical columns with bases and capitals
 *   - 3 distant dark walls (back, left, right)
 *   - 1 large pointed arch silhouette behind the pedestal
 *   - 1 ceiling plane to close the chamber top
 *
 * No GLB loading, no particles, no fog, no bloom, no animations.
 * Only simple geometry + dark rough stone materials.
 */

// ── Sub-components ───────────────────────────────────────────────────────────

/**
 * Single column with optional base (plinth) and capital.
 */
function Column({ position, config, sharedMaterial }) {
  const { radius, height, radialSegments, base, capital } = config
  const mat = sharedMaterial

  // Base Y: bottom of column sits at position.y - height/2
  // The position passed in already accounts for height centering
  const baseY = -height / 2 + (base.enabled ? base.height / 2 : 0)
  const capitalY = height / 2 - (capital.enabled ? capital.height / 2 : 0)

  return (
    <group position={position} name="column-group">
      {/* Column shaft */}
      <mesh castShadow receiveShadow name="column-shaft">
        <cylinderGeometry args={[radius, radius * 1.05, height, radialSegments]} />
        <meshStandardMaterial {...mat} />
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
          <meshStandardMaterial {...mat} />
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
          <meshStandardMaterial {...mat} />
        </mesh>
      )}
    </group>
  )
}

/**
 * Wall — a simple plane mesh.
 */
function Wall({ width, height, position, rotation, material }) {
  return (
    <mesh
      position={position}
      rotation={rotation}
      receiveShadow
      name="chamber-wall"
    >
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial {...material} side={THREE.DoubleSide} />
    </mesh>
  )
}

/**
 * ArchStructure — a pointed arch silhouette behind the pedestal.
 *
 * Built using ExtrudeGeometry: we define a 2D arch-shaped cross-section
 * (two pillars + curved arch top) and extrude it in Z for thickness.
 * This is entirely procedural — no models needed.
 */
function ArchStructure({ config, sharedMaterial }) {
  const {
    position,
    innerWidth,
    innerHeight,
    thickness,
    pillarWidth,
    totalHeight,
    archSegments,
    materialOverride,
  } = config

  const mat = materialOverride || sharedMaterial

  // Build the 2D arch shape
  const archShape = useMemo(() => {
    const shape = new THREE.Shape()
    const halfInner = innerWidth / 2
    const totalWidth = innerWidth + pillarWidth * 2
    const halfTotal = totalWidth / 2

    // Start at bottom-left corner
    shape.moveTo(-halfTotal, -0.05)

    // Left pillar — up
    shape.lineTo(-halfTotal, totalHeight)

    // Top span — across
    shape.lineTo(halfTotal, totalHeight)

    // Right pillar — down
    shape.lineTo(halfTotal, -0.05)

    // Right pillar inner edge — up to arch spring point
    shape.lineTo(halfInner, -0.05)
    shape.lineTo(halfInner, innerHeight * 0.65)

    // Arch curve — pointed arch (two arcs meeting at the crown)
    // Right side arc going up to crown
    const crownY = innerHeight
    const segments = Math.max(archSegments / 2, 6)

    // Use quadratic bezier for pointed arch shape
    // Right arc: from right spring point to crown
    shape.quadraticCurveTo(
      halfInner * 0.3, crownY * 0.95,  // control point (pulled inward for pointed look)
      0, crownY                          // crown point
    )

    // Left arc: from crown to left spring point
    shape.quadraticCurveTo(
      -halfInner * 0.3, crownY * 0.95, // control point
      -halfInner, innerHeight * 0.65    // left spring point
    )

    // Left pillar inner edge — down to bottom
    shape.lineTo(-halfInner, -0.05)

    // Close back to start
    shape.lineTo(-halfTotal, -0.05)

    return shape
  }, [innerWidth, innerHeight, pillarWidth, totalHeight, archSegments])

  // Extrude settings
  const extrudeSettings = useMemo(() => ({
    steps: 1,
    depth: thickness,
    bevelEnabled: false,
  }), [thickness])

  return (
    <mesh
      position={[position[0], position[1], position[2] - thickness / 2]}
      castShadow
      receiveShadow
      name="chamber-arch"
    >
      <extrudeGeometry args={[archShape, extrudeSettings]} />
      <meshStandardMaterial {...mat} side={THREE.DoubleSide} />
    </mesh>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

function ChamberEnvironment() {
  const { material, columns, walls, arch, ceiling, lighting } = CHAMBER_CONFIG

  // Resolve wall material
  const wallMat = walls.materialOverride || material
  const ceilingMat = ceiling.materialOverride || material

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
          sharedMaterial={columns.materialOverride || material}
        />
      ))}

      {/* ── Walls ───────────────────────────────────────────────────────── */}
      <Wall
        width={walls.back.width}
        height={walls.back.height}
        position={walls.back.position}
        rotation={walls.back.rotation}
        material={wallMat}
      />
      <Wall
        width={walls.left.width}
        height={walls.left.height}
        position={walls.left.position}
        rotation={walls.left.rotation}
        material={wallMat}
      />
      <Wall
        width={walls.right.width}
        height={walls.right.height}
        position={walls.right.position}
        rotation={walls.right.rotation}
        material={wallMat}
      />

      {/* ── Arch ────────────────────────────────────────────────────────── */}
      {arch.enabled && (
        <ArchStructure config={arch} sharedMaterial={material} />
      )}

      {/* ── Ceiling ─────────────────────────────────────────────────────── */}
      {ceiling.enabled && (
        <mesh
          position={ceiling.position}
          rotation={ceiling.rotation}
          receiveShadow
          name="chamber-ceiling"
        >
          <planeGeometry args={[ceiling.size, ceiling.size]} />
          <meshStandardMaterial {...ceilingMat} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  )
}

export default ChamberEnvironment
