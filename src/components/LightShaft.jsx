import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { LIGHT_SHAFT_CONFIG } from '../constants/sceneConfig'
import { animationState } from '../store/animationState'

// ---------------------------------------------------------------------------
// Cinematic Beam Texture Generator
// ---------------------------------------------------------------------------
//
// Creates a procedural alpha-map that mimics a dusty, atmospheric shaft of
// light as seen in the reference images. The key ingredients:
//
//   1. A tapered Gaussian core whose half-width interpolates from radiusTop
//      (wide, at the ceiling) down to radiusBottom (narrow, at the book),
//      then gently splays and fades past the focal point.
//
//   2. 3 subtle IRREGULAR sub-streaks that ride inside the main cone.
//      Each streak has its own width, horizontal offset, opacity, and a
//      low-frequency noise curve that makes it wander and pulse along the
//      beam length. They never exceed the main cone boundary.
//
//   3. A vertical brightness envelope:
//        - Soft fade-in at the top (light materialises from ceiling)
//        - Gentle undulating density changes through the body
//        - Long exponential dissolve into the floor (no hard cutoff)
//
//   4. High-frequency per-pixel multiplicative jitter so the interior
//      looks grainy/dusty rather than smooth. Because it is multiplicative,
//      pixels near zero stay near zero (no additive glow leaking outward).
//
//   5. Aggressive edge feathering via a wider Gaussian sigma so the beam
//      dissolves at its lateral edges rather than having a sharp boundary.
//
// The result is an irregular, organic shaft that reads as atmospheric
// density rather than a clean geometric polygon.
// ---------------------------------------------------------------------------

function createBeamTexture(resolution) {
  if (resolution === undefined) resolution = 512
  var cfg = LIGHT_SHAFT_CONFIG

  // Normalise radii into UV-space (plane goes 0..1 across its width)
  var planeWidth = cfg.radiusTop + cfg.radiusBottom
  var radiusTopN    = (cfg.radiusTop / planeWidth) * 0.5
  var radiusBottomN = (cfg.radiusBottom / planeWidth) * 0.5

  // What fraction of the texture height corresponds to source -> target?
  var src = new THREE.Vector3(...cfg.sourcePosition)
  var tgt = new THREE.Vector3(...cfg.targetPosition)
  var distToTarget = src.distanceTo(tgt)
  var extendDist   = 6.0
  var totalLength  = distToTarget + extendDist
  var tgtFraction  = distToTarget / totalLength

  var W = resolution
  var H = resolution

  // Seeded LCG (deterministic across hot-reloads)
  var seed = 0xdeadbeef
  var rng = function() {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff
    return (seed >>> 0) / 0xffffffff
  }

  // Low-frequency 1-D noise helper (cosine-interpolated)
  var makeNoiseCurve = function(numKnots) {
    var knots = Array.from({ length: numKnots + 1 }, function() { return rng() })
    return function(t) {
      var s = Math.max(0, Math.min(1, t)) * (numKnots - 1)
      var i = Math.floor(s)
      var f = s - i
      var c = (1 - Math.cos(f * Math.PI)) * 0.5
      return knots[i] * (1 - c) + knots[Math.min(i + 1, numKnots - 1)] * c
    }
  }

  // Noise curves for vertical density undulation and per-streak wander
  var vertNoise    = makeNoiseCurve(10)
  var streakNoise0 = makeNoiseCurve(14)
  var streakNoise1 = makeNoiseCurve(16)
  var streakNoise2 = makeNoiseCurve(12)

  // Sub-streak definitions
  var subStreaks = [
    { offset: -0.22, sigmaScale: 0.20, peakMul: 0.38, noiseFn: streakNoise0, wanderAmp: 0.08 },
    { offset:  0.30, sigmaScale: 0.13, peakMul: 0.25, noiseFn: streakNoise1, wanderAmp: 0.06 },
    { offset: -0.05, sigmaScale: 0.28, peakMul: 0.18, noiseFn: streakNoise2, wanderAmp: 0.10 },
  ]

  // Canvas setup
  var canvas  = document.createElement('canvas')
  canvas.width  = W
  canvas.height = H
  var ctx  = canvas.getContext('2d')
  var img  = ctx.createImageData(W, H)
  var data = img.data

  // Row-by-row, pixel-by-pixel
  for (var row = 0; row < H; row++) {
    var v = row / (H - 1)

    // Cone half-width at this V position
    var halfW
    if (v <= tgtFraction) {
      var t1 = v / tgtFraction
      halfW = radiusTopN * (1 - t1) + radiusBottomN * t1
    } else {
      var t2 = (v - tgtFraction) / (1 - tgtFraction)
      halfW = radiusBottomN + radiusBottomN * 0.6 * t2
    }

    // Vertical brightness envelope with natural density variation
    // and smooth floor fade (no abrupt cutoff)
    var vertBright
    if (v < 0.08) {
      // Soft fade-in at the ceiling
      vertBright = v / 0.08
    } else if (v <= tgtFraction) {
      var tV = (v - 0.08) / (tgtFraction - 0.08)
      var baseRamp = 0.70 + 0.30 * tV
      var wobble   = 0.85 + vertNoise(v) * 0.30
      vertBright = baseRamp * wobble
    } else {
      // Smooth floor fade: longer exponential dissolve
      // Uses a gentler decay constant so the beam melts into the floor
      var tPost = (v - tgtFraction) / (1 - tgtFraction)
      vertBright = Math.exp(-tPost * 2.5) * (1.0 - tPost * tPost)
      vertBright = Math.max(0, vertBright)
    }

    // AGGRESSIVE EDGE FEATHERING: wider Gaussian sigma = softer edges
    // Previously 0.55, now 0.38 — makes the Gaussian much broader
    // so edges dissolve more gradually into transparency
    var sigma     = halfW * 0.38
    var sharpness = 1.0 / (2 * sigma * sigma + 0.0001)

    // Per-row sub-streak noise variation
    var streakDensity = 0.70 + vertNoise(v * 1.7 + 0.3) * 0.60

    for (var col = 0; col < W; col++) {
      var u  = col / (W - 1)
      var du = u - 0.5

      // Main cone Gaussian with aggressive feathering
      var mainAlpha = Math.exp(-du * du * sharpness)

      // Extra lateral feathering: smoothstep the outer 40% to zero
      var edgeDist = Math.abs(du) / (halfW + 0.001)
      var feather = 1.0
      if (edgeDist > 0.6) {
        var ft = (edgeDist - 0.6) / 0.4
        ft = Math.min(1, ft)
        feather = 1.0 - ft * ft * (3.0 - 2.0 * ft) // smoothstep
      }
      mainAlpha *= feather

      // Sub-streak contributions (contained within main beam)
      var ssSum = 0
      for (var si = 0; si < subStreaks.length; si++) {
        var ss = subStreaks[si]
        var wander    = (ss.noiseFn(v) - 0.5) * ss.wanderAmp
        var centre    = (ss.offset + wander) * halfW
        var ssSigma   = ss.sigmaScale * halfW
        var ssSharpen = 1.0 / (2 * ssSigma * ssSigma + 0.0001)
        var d         = du - centre
        ssSum += ss.peakMul * Math.exp(-d * d * ssSharpen) * streakDensity
      }

      // Per-pixel multiplicative grain (dusty look)
      var jitter = 0.78 + rng() * 0.44

      // Composite alpha — reduced overall contribution
      var rawAlpha = Math.min(1.0, mainAlpha + ssSum * 0.30)
      var alpha    = vertBright * rawAlpha * jitter

      var idx      = (row * W + col) * 4
      data[idx]      = 255
      data[idx + 1]  = 255
      data[idx + 2]  = 255
      data[idx + 3]  = Math.max(0, Math.min(255, Math.round(alpha * 255)))
    }
  }

  ctx.putImageData(img, 0, 0)
  return new THREE.CanvasTexture(canvas)
}


// ---------------------------------------------------------------------------
// Animated Noise Mask Shader Material
// ---------------------------------------------------------------------------
// Custom shader that combines the procedural beam alpha-map with an animated
// noise pattern. This creates subtle roiling/crawling density variation
// that makes the beam feel alive and atmospheric — like real dust scattering
// light in a cathedral or ruin.
// ---------------------------------------------------------------------------

var beamVertexShader = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

var beamFragmentShader = /* glsl */`
  uniform sampler2D uAlphaMap;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uTime;

  varying vec2 vUv;

  // Simplex-style 2D noise (compact GLSL implementation)
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    // Sample the procedural beam alpha-map
    float beamAlpha = texture2D(uAlphaMap, vUv).a;

    // Animated noise mask — multiple octaves for organic feel
    // Scrolls slowly upward to simulate rising dust currents
    vec2 noiseUV = vUv * vec2(3.0, 5.0);
    float drift = uTime * 0.06;

    float n1 = snoise(noiseUV + vec2(0.0, -drift)) * 0.5 + 0.5;
    float n2 = snoise(noiseUV * 2.3 + vec2(drift * 0.7, -drift * 1.3)) * 0.5 + 0.5;
    float n3 = snoise(noiseUV * 4.7 + vec2(-drift * 0.5, drift * 0.8)) * 0.5 + 0.5;

    // Combine octaves: large-scale density shifts + medium detail + fine grain
    float noiseMask = n1 * 0.55 + n2 * 0.30 + n3 * 0.15;

    // Remap to keep brightness centred — avoid making the beam too dark
    // Range roughly 0.55..1.0 so it only subtracts, never fully kills the beam
    noiseMask = 0.50 + noiseMask * 0.50;

    // Final alpha: beam texture × noise × overall opacity
    float finalAlpha = beamAlpha * noiseMask * uOpacity;

    gl_FragColor = vec4(uColor, finalAlpha);
  }
`


// ---------------------------------------------------------------------------
// LightShaft Component
// ---------------------------------------------------------------------------
export default function LightShaft() {
  var cfg = LIGHT_SHAFT_CONFIG

  var meshRef = useRef()
  var spotRef = useRef()

  // Procedural beam alpha texture
  var gradientTex = useMemo(function() { return createBeamTexture(512) }, [])

  // Custom shader material with animated noise mask
  var shaderMaterial = useMemo(function() {
    var color = new THREE.Color(cfg.color)
    return new THREE.ShaderMaterial({
      uniforms: {
        uAlphaMap: { value: gradientTex },
        uColor:    { value: color },
        uOpacity:  { value: 0.0 },
        uTime:     { value: 0.0 },
      },
      vertexShader: beamVertexShader,
      fragmentShader: beamFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    })
  }, [gradientTex, cfg.color])

  // Beam geometry and orientation
  var beamGeo = useMemo(function() {
    var src = new THREE.Vector3(...cfg.sourcePosition)
    var tgt = new THREE.Vector3(...cfg.targetPosition)
    var direction = new THREE.Vector3().subVectors(tgt, src).normalize()

    var distToTarget = src.distanceTo(tgt)
    var extendDist   = 6.0
    var totalLength  = distToTarget + extendDist

    var midpoint = src.clone().addScaledVector(direction, totalLength * 0.5)
    var avgWidth = cfg.radiusTop + cfg.radiusBottom

    return {
      pos: midpoint,
      length: totalLength,
      width: avgWidth,
      dir: direction,
    }
  }, [cfg.sourcePosition, cfg.targetPosition, cfg.radiusTop, cfg.radiusBottom])

  var pos    = beamGeo.pos
  var length = beamGeo.length
  var width  = beamGeo.width
  var dir    = beamGeo.dir

  // SpotLight target object (separate light for book/pedestal illumination)
  var spotTarget = useMemo(function() {
    var obj = new THREE.Object3D()
    obj.position.set(...cfg.targetPosition)
    return obj
  }, [cfg.targetPosition])

  // Animate opacity, noise, and cylindrical billboard each frame
  useFrame(function(state) {
    var progress = animationState.effectProgress
    // Reduced peak opacity: was 0.32, now ~0.14 (about 18% lower than even
    // a hypothetical previous reduction). The beam should be ghostly/atmospheric.
    var peakOpacity = 0.14

    if (meshRef.current) {
      // Update shader uniforms
      shaderMaterial.uniforms.uOpacity.value = peakOpacity * progress
      shaderMaterial.uniforms.uTime.value = state.clock.elapsedTime

      // Cylindrical Billboard:
      // Y-axis aligns with beam direction, Z-axis (normal) faces camera.
      var cameraPos = state.camera.position
      var toCam     = new THREE.Vector3().subVectors(cameraPos, pos)
      var dotVal    = toCam.dot(dir)
      var projToCam = toCam.sub(dir.clone().multiplyScalar(dotVal))

      if (projToCam.lengthSq() > 0.0001) {
        projToCam.normalize()
        var yAxis = dir.clone()
        var zAxis = projToCam.clone()
        var xAxis = new THREE.Vector3().crossVectors(yAxis, zAxis).normalize()

        var rotationMatrix = new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis)
        meshRef.current.quaternion.setFromRotationMatrix(rotationMatrix)
      }
    }

    // Spotlight provides most visible illumination — boosted intensity
    if (spotRef.current) {
      spotRef.current.intensity = 55 * progress
    }
  })

  if (!cfg.enabled) return null

  return (
    <group name="light-shaft-root">
      <primitive object={spotTarget} />

      {/* Real SpotLight for actual warm illumination on book/pedestal/floor */}
      {/* Boosted intensity + wider penumbra so the spot is the dominant light source */}
      <spotLight
        ref={spotRef}
        name="sunbeam-spot"
        color="#ffc88a"
        intensity={0}
        position={cfg.sourcePosition}
        target={spotTarget}
        angle={Math.PI / 7.5}
        penumbra={0.92}
        distance={32}
        decay={1.0}
        castShadow={false}
      />

      {/* Atmospheric billboard mesh (visual beam only, no illumination) */}
      <mesh ref={meshRef} position={pos} material={shaderMaterial}>
        <planeGeometry args={[width, length, 1, 1]} />
      </mesh>
    </group>
  )
}