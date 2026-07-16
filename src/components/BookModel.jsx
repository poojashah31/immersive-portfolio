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
 * The OBJ origin is at a corner (Blender default export).
 * After loading, we translate the book geometry so it is centered on the
 * pedestal before rotation is applied.
 *
 * Rotation [-π/2, yAngle, 0] lays the book flat on the pedestal surface.
 *
 * This component must be wrapped in <Suspense> by its parent.
 */
function BookModel() {
  const { objPath, mtlPath, scale, rotation, positionXZ } = BOOK_CONFIG

  // Pedestal top surface Y
  const pedestalTopY = PEDESTAL_CONFIG.top.y + PEDESTAL_CONFIG.top.height / 2

  // Ref to the outer centering group — we apply position after loading
  const centerGroupRef = useRef()

  // Step 1: Load materials
  const materials = useLoader(MTLLoader, mtlPath)

  // Step 2: Load OBJ with preloaded materials
  const obj = useLoader(OBJLoader, objPath, (loader) => {
    materials.preload()
    loader.setMaterials(materials)
  })

  useEffect(() => {
    // Center the geometry by offsetting the centering group position
    // such that the bounding box center aligns with the pivot
    const bbox = new Box3().setFromObject(obj)
    const center = new Vector3()
    bbox.getCenter(center)

    // In OBJ space (before rotation):
    // Center X and Z in OBJ space → center the book horizontally
    // Leave Y alone so the book bottom (Y=0 in OBJ) stays at pedestal surface
    if (centerGroupRef.current) {
      centerGroupRef.current.position.set(-center.x, 0, -center.z)
    }

    // Enable shadows on all child meshes
    obj.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [obj])

  return (
    <group
      name="book-model-wrapper"
      position={[positionXZ[0], pedestalTopY + 0.145, positionXZ[1]]}
      rotation={rotation}
      scale={scale}
    >
      {/* This group's position is set post-load to center the geometry */}
      <group ref={centerGroupRef} name="book-model-center">
        <primitive object={obj} name="book-model" />
      </group>
    </group>
  )
}

export default BookModel
