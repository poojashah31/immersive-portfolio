import React, { Suspense } from 'react'
import SceneLighting from '../components/SceneLighting'
import Pedestal from '../components/Pedestal'
import BookModel from '../components/BookModel'
import CameraRig from '../components/CameraRig'

/**
 * IntroScene Component — Phase 1: Book Introduction
 *
 * Composes the opening cinematic scene:
 *   - CameraRig performs the slow GSAP-driven dolly push-in
 *   - SceneLighting provides warm atmospheric candle-like lighting
 *   - Pedestal is a simple stone lectern built from box geometry
 *   - BookModel loads the OBJ/MTL book and places it on the pedestal
 *
 * BookModel is wrapped in Suspense because useLoader suspends rendering
 * while assets are fetched. The fallback renders nothing, keeping the
 * scene dark until the model is ready — matching the intent of the
 * "begins in darkness" brief.
 *
 * No interaction. No UI. No text. No particles. Only atmosphere.
 */
function IntroScene() {
  return (
    <group name="intro-scene-root">
      {/* Camera dolly animation — logic only, renders nothing */}
      <CameraRig />

      {/* Atmospheric warm lighting */}
      <SceneLighting />

      {/* Stone pedestal — always visible even while book loads */}
      <Pedestal />

      {/* Book model — suspended until OBJ + MTL + texture are ready */}
      <Suspense fallback={null}>
        <BookModel />
      </Suspense>
    </group>
  )
}

export default IntroScene
