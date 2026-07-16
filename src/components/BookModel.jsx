import React, { useEffect, useRef } from 'react'
import { useLoader } from '@react-three/fiber'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { Box3, Vector3 } from 'three'
import { BOOK_CONFIG, PEDESTAL_CONFIG } from '../constants/sceneConfig'

/**
 * BookModel Component
 *
 * Loads the OldBook001 OBJ model with its MTL material and PNG texture.
 *
 * ── Axis mapping under rotation [-π/2, 0, 0] ──────────────────────
 * The wrapper group has rotation [-π/2, 0, 0], which remaps axes:
 *   OBJ local X  →  world X  (unchanged)
 *   OBJ local Y  →  world -Z  (book standing height becomes Z depth)
 *   OBJ local Z  →  world +Y  (book thickness becomes the up axis)
 *
 * Consequence: to center the book in world Z, we must center local Y
 * (not local Z). Centering local Z would only shift world Y, not world Z.
 * The previous code incorrectly offset local Z instead of local Y,
 * causing a large Z offset that looked fine from straight ahead but
 * was clearly wrong when viewed from the side.
 *
 * ── Placement strategy ────────────────────────────────────────────
 *   1. Correct inner-group centering: offset local X and local Y so
 *      the OBJ's centroid aligns with the wrapper's pivot in X and Z world.
 *   2. Force world matrix update on the wrapper.
 *   3. Measure the book's actual world-space bbox (post rotation + scale).
 *   4. Offset the wrapper so the book's world center.x/z matches the
 *      pedestal's world center.x/z (from PEDESTAL_CONFIG, measured by Pedestal).
 *   5. Lift the wrapper so the book's world bbox.min.y sits exactly on
 *      the pedestal top surface + a small anti-z-fighting gap.
 *   6. If the book footprint exceeds a safe fraction of the pedestal top,
 *      uniformly scale it down and re-align.
 *
 * This component must be wrapped in <Suspense> by its parent.
 */
function BookModel() {
  const { objPath, mtlPath, scale, rotation, positionXZ } = BOOK_CONFIG

  // Wrapper: rotation + scale applied here. Position.y is set post-load.
  const wrapperRef = useRef()
  // Inner group: XZ centering applied here post-load.
  const centerGroupRef = useRef()

  // Step 1: Load materials
  const materials = useLoader(MTLLoader, mtlPath)

  // Step 2: Load OBJ with preloaded materials
  const obj = useLoader(OBJLoader, objPath, (loader) => {
    materials.preload()
    loader.setMaterials(materials)
  })

  useEffect(() => {
    if (!centerGroupRef.current || !wrapperRef.current) return

    // ── Step A: Measure OBJ local bbox ──────────────────────────────
    // This is in the OBJ's own local space, before any wrapper transform.
    const localBbox = new Box3().setFromObject(obj)
    const localCenter = new Vector3()
    localBbox.getCenter(localCenter)

    // ── Step B: Center in world X and Z via inner-group local offset ─
    // rotation [-π/2, 0, 0] axis map: local X→world X, local Y→world -Z
    // To zero world X: offset inner group's local X by -localCenter.x  ✓
    // To zero world Z: offset inner group's local Y by -localCenter.y  ✓
    //   (because local Y becomes world -Z after rotation)
    // Do NOT touch local Z — that maps to world Y (height), leave it at 0.
    centerGroupRef.current.position.set(
      -localCenter.x,  // centers world X
      -localCenter.y,  // centers world Z (local Y → world -Z after rotation)
      0                // leave local Z alone (local Z → world Y)
    )

    // ── Step C: Force world matrix update ───────────────────────────
    wrapperRef.current.updateWorldMatrix(true, true)

    // ── Step D: Measure actual world-space bbox post-rotation ────────
    const worldBbox = new Box3().setFromObject(wrapperRef.current)
    const worldCenter = new Vector3()
    worldBbox.getCenter(worldCenter)

    // ── Step E: Align wrapper with pedestal center X, Z ─────────────
    // PEDESTAL_CONFIG.centerX/Z are measured and written by Pedestal.jsx
    const pedestalCenterX = PEDESTAL_CONFIG.centerX
    const pedestalCenterZ = PEDESTAL_CONFIG.centerZ
    const pedestalTopY    = PEDESTAL_CONFIG.topSurfaceY
    const GAP             = 0.01  // anti-z-fighting gap

    wrapperRef.current.position.x += (pedestalCenterX - worldCenter.x)
    wrapperRef.current.position.z += (pedestalCenterZ - worldCenter.z)

    // ── Step F: Lift book to sit on pedestal top ─────────────────────
    // worldBbox.min.y is the book's lowest world point.
    // Shift wrapper up so that lowest point = pedestalTopY + gap.
    wrapperRef.current.position.y += (pedestalTopY + GAP - worldBbox.min.y)

    // ── Step G: Scale down if book footprint exceeds pedestal top ────
    wrapperRef.current.updateWorldMatrix(true, true)
    const scaledBbox  = new Box3().setFromObject(wrapperRef.current)
    const bookWorldW  = scaledBbox.max.x - scaledBbox.min.x
    const bookWorldD  = scaledBbox.max.z - scaledBbox.min.z
    const pedestalW   = PEDESTAL_CONFIG.worldWidth
    const pedestalD   = PEDESTAL_CONFIG.worldDepth

    // Book should occupy at most 80% of the pedestal bounding box extents
    const MAX_RATIO   = 0.80
    const ratioX      = (pedestalW * MAX_RATIO) / bookWorldW
    const ratioZ      = (pedestalD * MAX_RATIO) / bookWorldD
    const scaleDown   = Math.min(ratioX, ratioZ)

    if (scaleDown < 1.0) {
      const cur = wrapperRef.current.scale.x
      const ns  = cur * scaleDown
      wrapperRef.current.scale.set(ns, ns, ns)

      // Re-align after scale change
      wrapperRef.current.updateWorldMatrix(true, true)
      const reBbox   = new Box3().setFromObject(wrapperRef.current)
      const reCenter = new Vector3()
      reBbox.getCenter(reCenter)

      wrapperRef.current.position.x += (pedestalCenterX - reCenter.x)
      wrapperRef.current.position.z += (pedestalCenterZ - reCenter.z)
      wrapperRef.current.position.y += (pedestalTopY + GAP - reBbox.min.y)

      if (import.meta.env.DEV) {
        console.log('[BookModel] Scaled down by ratio:', scaleDown.toFixed(3), '→ new scale:', ns.toFixed(3))
      }
    }

    // ── Step H: Enable shadows ────────────────────────────────────────
    obj.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    if (import.meta.env.DEV) {
      const finalBbox = new Box3().setFromObject(wrapperRef.current)
      console.log('[BookModel] localBbox Y:', localBbox.min.y.toFixed(3), '→', localBbox.max.y.toFixed(3), ' (height maps to world Z after rotation)')
      console.log('[BookModel] finalWorldBbox X:', finalBbox.min.x.toFixed(3), '→', finalBbox.max.x.toFixed(3))
      console.log('[BookModel] finalWorldBbox Y:', finalBbox.min.y.toFixed(3), '→', finalBbox.max.y.toFixed(3))
      console.log('[BookModel] finalWorldBbox Z:', finalBbox.min.z.toFixed(3), '→', finalBbox.max.z.toFixed(3))
      console.log('[BookModel] wrapper position:', wrapperRef.current.position.toArray().map(v => v.toFixed(3)))
    }
  }, [obj])

  return (
    <group
      ref={wrapperRef}
      name="book-model-wrapper"
      // Initial position — useEffect overwrites Y (and adjusts X/Z if needed)
      position={[positionXZ[0], PEDESTAL_CONFIG.topSurfaceY, positionXZ[1]]}
      rotation={rotation}
      scale={scale}
    >
      {/* Inner group: local X/Y offset applied post-load for world X/Z centering */}
      <group ref={centerGroupRef} name="book-model-center">
        <primitive object={obj} name="book-model" />
      </group>
    </group>
  )
}

export default BookModel
