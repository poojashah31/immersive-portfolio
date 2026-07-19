/**
 * useChamberTextures.js
 *
 * Custom hook that loads and configures all PBR texture sets for the chamber
 * environment. Returns pre-configured material property objects that can be
 * spread directly into <meshStandardMaterial>.
 *
 * Texture sets loaded:
 *   wall   → Rock Wall 13 (diffuse, normal, roughness)
 *   floor  → Red Sandstone Tiles (diffuse, normal, roughness)
 *   column → Dark Rock (diffuse, normal, roughness)
 *
 * Each texture is configured with:
 *   - RepeatWrapping for tiling
 *   - SRGBColorSpace for diffuse/color maps
 *   - LinearSRGBColorSpace for normal and roughness maps (data textures)
 *   - Independent repeat values per surface element
 *
 * Usage:
 *   const textures = useChamberTextures()
 *   // textures.wall.backWall → material props for back wall
 *   // textures.floor → material props for floor
 *   // textures.column.shaft → material props for column shaft
 */

import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { CHAMBER_TEXTURES } from '../constants/sceneConfig'

/**
 * Clone a texture and apply repeat + wrapping settings.
 * Cloning is necessary because each surface element needs its own repeat value
 * but we want to share the underlying image data.
 */
function configureTexture(texture, repeat, isColorMap = false) {
  const t = texture.clone()
  t.wrapS = THREE.RepeatWrapping
  t.wrapT = THREE.RepeatWrapping
  t.repeat.set(repeat[0], repeat[1])
  // Color maps need sRGB; data maps (normal, roughness) stay linear
  t.colorSpace = isColorMap ? THREE.SRGBColorSpace : THREE.LinearSRGBColorSpace
  t.needsUpdate = true
  return t
}

/**
 * Build a material props object for a given texture set + repeat value.
 * Returns an object that can be spread into <meshStandardMaterial {...props} />.
 */
function buildMaterialProps(diffuseTex, normalTex, roughnessTex, repeat, config) {
  const map = configureTexture(diffuseTex, repeat, true)
  const normalMap = configureTexture(normalTex, repeat, false)
  const roughnessMap = configureTexture(roughnessTex, repeat, false)

  return {
    map,
    normalMap,
    normalScale: new THREE.Vector2(config.normalScale, config.normalScale),
    roughnessMap,
    roughness: 1.0, // Let the roughness map drive it fully
    color: config.color,
    metalness: config.metalness,
  }
}

export default function useChamberTextures() {
  const wallCfg = CHAMBER_TEXTURES.wall
  const floorCfg = CHAMBER_TEXTURES.floor
  const columnCfg = CHAMBER_TEXTURES.column

  // Load all 9 textures (3 sets × 3 maps each)
  const [
    wallDiff, wallNorm, wallRough,
    floorDiff, floorNorm, floorRough,
    colDiff, colNorm, colRough,
  ] = useLoader(THREE.TextureLoader, [
    wallCfg.diffuse, wallCfg.normal, wallCfg.roughness,
    floorCfg.diffuse, floorCfg.normal, floorCfg.roughness,
    columnCfg.diffuse, columnCfg.normal, columnCfg.roughness,
  ])

  // Build material props for each surface element
  const materials = useMemo(() => ({
    wall: {
      backWall: buildMaterialProps(wallDiff, wallNorm, wallRough, wallCfg.repeat.backWall, wallCfg),
      sideWall: buildMaterialProps(wallDiff, wallNorm, wallRough, wallCfg.repeat.sideWall, wallCfg),
      arch:     buildMaterialProps(wallDiff, wallNorm, wallRough, wallCfg.repeat.arch, wallCfg),
      ceiling:  buildMaterialProps(wallDiff, wallNorm, wallRough, wallCfg.repeat.ceiling, wallCfg),
    },
    floor: buildMaterialProps(floorDiff, floorNorm, floorRough, floorCfg.repeat, floorCfg),
    column: {
      shaft:   buildMaterialProps(colDiff, colNorm, colRough, columnCfg.repeat.shaft, columnCfg),
      base:    buildMaterialProps(colDiff, colNorm, colRough, columnCfg.repeat.base, columnCfg),
      capital: buildMaterialProps(colDiff, colNorm, colRough, columnCfg.repeat.capital, columnCfg),
    },
  }), [
    wallDiff, wallNorm, wallRough,
    floorDiff, floorNorm, floorRough,
    colDiff, colNorm, colRough,
  ])

  return materials
}

// Preload all chamber textures so they start downloading immediately
useLoader.preload(THREE.TextureLoader, [
  CHAMBER_TEXTURES.wall.diffuse, CHAMBER_TEXTURES.wall.normal, CHAMBER_TEXTURES.wall.roughness,
  CHAMBER_TEXTURES.floor.diffuse, CHAMBER_TEXTURES.floor.normal, CHAMBER_TEXTURES.floor.roughness,
  CHAMBER_TEXTURES.column.diffuse, CHAMBER_TEXTURES.column.normal, CHAMBER_TEXTURES.column.roughness,
])
