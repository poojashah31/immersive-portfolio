import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { DUST_PARTICLES_CONFIG, LIGHT_SHAFT_CONFIG } from '../constants/sceneConfig'
import { animationState } from '../store/animationState'

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function createDustTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')
  
  const cx = 16
  const cy = 16
  const radius = 16
  
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)')
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 32, 32)
  
  return new THREE.CanvasTexture(canvas)
}

export default function DustParticles() {
  const cfg = DUST_PARTICLES_CONFIG
  const lightCfg = LIGHT_SHAFT_CONFIG

  const pointsRef = useRef()
  const materialRef = useRef()
  const velocitiesRef = useRef()
  const texture = useMemo(() => createDustTexture(), [])

  // Calculate the beam dimensions to confine the dust
  const { pos, length, quaternion, width } = useMemo(() => {
    const src = new THREE.Vector3(...lightCfg.sourcePosition)
    const tgt = new THREE.Vector3(...lightCfg.targetPosition)
    const dir = new THREE.Vector3().subVectors(tgt, src).normalize()
    // The total distance of the beam, extended past the target
    const distToTarget = src.distanceTo(tgt)
    const extendDist = 6.0 // Extend 6 units past the book
    const totalLength = distToTarget + extendDist
    
    // The midpoint of the EXTENDED beam
    const midpoint = src.clone().addScaledVector(dir, totalLength * 0.5)

    // Match the same local alignment as the light planes (Y-axis points along beam)
    const alignQ = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir
    )

    const avgWidth = (lightCfg.radiusTop + lightCfg.radiusBottom)

    return { 
      pos: midpoint, 
      length: totalLength, 
      quaternion: alignQ,
      width: avgWidth
    }
  }, [lightCfg.sourcePosition, lightCfg.targetPosition, lightCfg.radiusTop, lightCfg.radiusBottom])

  // Build initial positions + velocity arrays in LOCAL space
  const positions = useMemo(() => {
    const rand = seededRandom(cfg.seed)
    const posArr = new Float32Array(cfg.count * 3)
    const velArr = new Float32Array(cfg.count * 3)

    // We define the spawn box bounds in local space:
    // Local X and Z span the width of the beam. Local Y spans the length.
    const hw = width / 2
    const hd = width / 2
    const hh = length / 2

    for (let i = 0; i < cfg.count; i++) {
      const i3 = i * 3
      // Random position within local spawn volume
      posArr[i3]     = (rand() * 2 - 1) * hw
      posArr[i3 + 1] = (rand() * 2 - 1) * hh
      posArr[i3 + 2] = (rand() * 2 - 1) * hd

      // Initial velocity points mostly along +Y (which points toward the target in global space)
      velArr[i3]     = (rand() * 2 - 1) * cfg.speed * 0.2
      velArr[i3 + 1] = cfg.speed + (rand() * 2 - 1) * cfg.speed * 0.5
      velArr[i3 + 2] = (rand() * 2 - 1) * cfg.speed * 0.2
    }

    velocitiesRef.current = velArr
    return posArr
  }, [cfg.count, cfg.seed, width, length, cfg.speed])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])

  // Per-frame drift update and opacity sync
  useFrame(() => {
    if (materialRef.current) {
      // Sync opacity with global effect progress
      materialRef.current.opacity = cfg.targetOpacity * animationState.effectProgress
    }

    if (!pointsRef.current || !velocitiesRef.current) return

    const posAttr = pointsRef.current.geometry.attributes.position
    const vel = velocitiesRef.current

    // Local bounds
    const hw = width / 2
    const hd = width / 2
    const hh = length / 2

    for (let i = 0; i < cfg.count; i++) {
      const i3 = i * 3

      // Add tiny random turbulence to velocity each frame (in local X and Z only, mostly)
      vel[i3]     += (Math.random() * 2 - 1) * cfg.turbulence
      vel[i3 + 2] += (Math.random() * 2 - 1) * cfg.turbulence

      // Damp velocity on X/Z to keep them from wandering too far horizontally
      vel[i3]     *= 0.99
      vel[i3 + 2] *= 0.99

      // Ensure Y velocity keeps them moving down the shaft
      vel[i3 + 1] = Math.max(vel[i3 + 1], cfg.speed * 0.5)

      // Advance position
      posAttr.array[i3]     += vel[i3]
      posAttr.array[i3 + 1] += vel[i3 + 1]
      posAttr.array[i3 + 2] += vel[i3 + 2]

      // Wrap particles that leave the local spawn volume
      const px = posAttr.array[i3]
      const py = posAttr.array[i3 + 1]
      const pz = posAttr.array[i3 + 2]

      if (px < -hw) posAttr.array[i3] = hw
      if (px > hw)  posAttr.array[i3] = -hw
      if (pz < -hd) posAttr.array[i3 + 2] = hd
      if (pz > hd)  posAttr.array[i3 + 2] = -hd
      
      // If a particle reaches the end of the shaft (bottom, +Y in local space)
      // Wrap it back to the top (-Y in local space)
      if (py > hh) {
        posAttr.array[i3 + 1] = -hh
        // Randomize X and Z when wrapping to avoid clumps
        posAttr.array[i3] = (Math.random() * 2 - 1) * hw
        posAttr.array[i3 + 2] = (Math.random() * 2 - 1) * hd
      }
      if (py < -hh) {
        posAttr.array[i3 + 1] = hh
      }
    }

    posAttr.needsUpdate = true
  })

  if (!cfg.enabled) return null

  return (
    // Wrap the points in a group positioned and rotated to match the light shaft
    <group position={pos} quaternion={quaternion}>
      <points ref={pointsRef} name="dust-particles" geometry={geometry}>
        <pointsMaterial
          ref={materialRef}
          color={cfg.color}
          size={cfg.size}
          sizeAttenuation={cfg.sizeAttenuation}
          transparent
          opacity={0} // Starts at 0
          alphaMap={texture}
          alphaTest={0.01}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  )
}
