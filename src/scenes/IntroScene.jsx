import React, { Suspense } from 'react'
import SceneLighting from '../components/SceneLighting'
import Pedestal from '../components/Pedestal'
import BookModel from '../components/BookModel'
import CameraRig from '../components/CameraRig'
import ChamberFloor from '../components/ChamberFloor'
import ChamberEnvironment from '../components/ChamberEnvironment'
import DustParticles from '../components/DustParticles'
import LightShaft from '../components/LightShaft'

/**
 * IntroScene Component — Phase 1 + 2: Book Introduction + Atmosphere
 *
 * Composes the opening cinematic scene:
 *   - CameraRig performs the slow GSAP-driven dolly push-in
 *   - SceneLighting provides warm atmospheric candle-like lighting
 *   - ChamberFloor provides a simple dark ground plane (Phase 2)
 *   - ChamberEnvironment adds procedural columns, walls, arch (Phase 2)
 *   - Pedestal is a stylized stone lectern loaded from GLB
 *   - BookModel loads the OBJ/MTL book and places it on the pedestal
 *   - DustParticles adds sparse floating dust motes in the lit area
 *   - LightShaft adds a diagonal cinematic sunbeam
 *
 * Both GLB models (pedestal) are wrapped in Suspense.
 * BookModel uses useLoader which also suspends; the outer Suspense covers it.
 *
 * No interaction. No UI. No text. Only atmosphere.
 */
function IntroScene() {
  return (
    <Suspense fallback={null}>
      <group name="intro-scene-root">
        {/* Camera dolly animation — logic only, renders nothing */}
        <CameraRig />

        {/* Atmospheric warm lighting */}
        <SceneLighting />

        {/* Stone pedestal — suspended until GLB loads */}
        <Pedestal />

        {/* Phase 2: Chamber environment + floor — suspended while PBR textures load */}
        <ChamberFloor />
        <ChamberEnvironment />

        {/* Book model — suspended until OBJ + MTL + texture are ready */}
        <BookModel />

        {/* Phase 3: Floating dust motes — sparse particles drifting in the lit zone */}
        <DustParticles />
        <LightShaft />
      </group>
    </Suspense>
  )
}

export default IntroScene

