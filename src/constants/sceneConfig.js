/**
 * sceneConfig.js
 *
 * Central configuration for scene constants.
 * Avoids hardcoded values inside components.
 * All units are Three.js world units.
 *
 * ── Geometry Reference ───────────────────────────────────────────
 * OBJ book model (OldBook001):
 *   X: -0.71 → +0.69  (width ≈ 1.4 units)
 *   Y:  0.00 → +2.10  (height ≈ 2.1 units — book stands tall in Y)
 *   Z:  0.00 → +0.35  (depth ≈ 0.35 units — very thin)
 *
 * The model is oriented with Y-up, standing vertically.
 * We rotate it 90° on X to lay it flat (book lying on pedestal).
 *
 * After BOOK_CONFIG.scale = [0.8, 0.8, 0.8] and X-rotation:
 *   Width  (X) ≈ 1.12 units
 *   Height (Z) ≈ 1.68 units (was Y depth)
 *   Depth  (Y) ≈ 0.28 units (thickness of book when flat)
 *
 * Pedestal top surface Y = pedestal.top.y + pedestal.top.height/2
 * = 0.85 + 0.06 = 0.91
 *
 * Book center Y (when flat) ≈ 0.91 + 0.14 = 1.05
 * Camera lookAt target Y = 1.05 (center of the flat book)
 * ─────────────────────────────────────────────────────────────────
 */

// ─── Camera ──────────────────────────────────────────────────────────────────

export const CAMERA_CONFIG = {
  // Starting position — far enough back to see full pedestal + book clearly
  startPosition: [0, 2.0, 7.0],
  // Intermediate position — approaches and begins to elevate
  midPosition: [0, 2.8, 4.0],
  // End position — elevated hero close-up framing book on pedestal top
  endPosition: [-0.037, 3.868, 1.732],
  // Aim at the top 1/3 of the pedestal — where the book sits
  lookAt: [0, 1.5, 0],
  // Vertical field of view in degrees
  fov: 50,
  near: 0.1,
  far: 100,
  // OrbitControls limits — allow wide zoom range for inspection
  controls: {
    minDistance: 1.0,
    maxDistance: 20.0,
  }
}

// ─── Dolly Animation ─────────────────────────────────────────────────────────

export const DOLLY_CONFIG = {
  // Seconds before the camera begins moving (lets the scene fully render first)
  delay: 0.5,
  // Total duration of the camera push-in
  duration: 5.0,
  // GSAP ease — slow start, slow stop
  ease: 'power2.inOut',
}

// ─── Lighting ────────────────────────────────────────────────────────────────

export const LIGHTING_CONFIG = {
  // Ambient — very low, neutral white. Stone retains its grey texture.
  ambient: {
    color: '#d0d0d0',
    intensity: 0.15,
  },
  // Key light — warm golden, positioned tightly above the book only.
  // Low distance (6) so it falls off before it fully warms the stone column.
  keyLight: {
    color: '#f0c060',
    intensity: 12,
    position: [0.5, 2.5, 1.5],
    distance: 6,
    decay: 2,
  },
  // Fill light — cool-neutral to preserve stone grey on the shadow side
  fillLight: {
    color: '#8090a0',
    intensity: 4,
    position: [-2.0, 1.5, 2.5],
    distance: 9,
    decay: 2,
  },
  // Rim light — very faint neutral white edge separation from behind
  rimLight: {
    color: '#c0c0c0',
    intensity: 3,
    position: [0, 2.0, -2.5],
    distance: 7,
    decay: 2,
  },
}

// ─── Scene Background ─────────────────────────────────────────────────────────

export const SCENE_CONFIG = {
  background: '#0a0908', // Dark warm background
  fog: {
    color: '#0a0908',
    near: 25,       // Pushed WAY back so architecture is not fogged out
    far: 60,        // Very far — allows distant walls to remain visible
  },
}

// ─── Book Model ───────────────────────────────────────────────────────────────

export const BOOK_CONFIG = {
  // Paths relative to /public — served by Vite dev server
  objPath: '/models/books/OldBook001.obj',
  mtlPath: '/models/books/OldBook001.mtl',
  // Scale: keep it readable relative to the pedestal
  scale: [0.9, 0.9, 0.9],
  // The book OBJ is oriented vertically (Y = spine height).
  // rotationX: -π/2 lays it flat so the cover (originally the Z=0 face) faces up.
  // rotationY: slight positive angle so the cover angled naturally toward camera.
  // NO Z rotation applied — that causes unwanted tilting.
  rotation: [-Math.PI / 2, Math.PI * 0.0, 0],
  // Centered on the pedestal
  positionXZ: [0, 0],
}

// ─── Pedestal ─────────────────────────────────────────────────────────────────
//
// Stylized stone pedestal GLB
// The topSurfaceY property defines where the book rests.

export const PEDESTAL_CONFIG = {
  modelPath: '/models/pedestal/stylized_pedestal.glb',
  position: [0, 0, 0],
  // Scale: keep the pedestal proportionate, not dominating the scene.
  scale: [0.5, 0.5, 0.5],

  // ── Runtime-measured values (written by Pedestal.jsx after bbox calculation) ──
  // Fallback values are used only for the initial React render; the real values
  // are overwritten in Pedestal's useEffect as soon as the GLB is mounted.
  topSurfaceY: 1.4,   // world-space Y of the pedestal top surface
  centerX: 0,         // world-space X center of the pedestal bounding box
  centerZ: 0,         // world-space Z center of the pedestal bounding box
  worldWidth: 1.2,    // world-space X extent of the full pedestal bbox
  worldDepth: 1.2,    // world-space Z extent of the full pedestal bbox
}

// ─── Chamber Environment (Procedural) ─────────────────────────────────────────
//
// Procedural ancient chamber built with simple Three.js geometry.
// Replaces the old GLB-based environment that caused camera intersection.
//
// Design intent: a vast, forgotten ancient magical chamber that frames the
// book + pedestal as the hero composition. Architecture should mostly
// disappear into shadow — dark rough stone, minimal highlight.
//
// Coordinate reference:
//   Pedestal sits at world origin [0, 0, 0], topSurfaceY ≈ 1.4
//   Camera path:  start [0, 2.0, 7.0] → mid [0, 2.8, 4.0] → end [-0.037, 3.868, 1.732]
//   Camera Z range: 7.0 → 1.73 (approaches from +Z)
//   OrbitControls maxDistance: 20 units
//
// ALL environment geometry values live here for easy tuning.

export const CHAMBER_CONFIG = {
  // ── Shared Material ──────────────────────────────────────────────────────
  // DEBUG EVALUATION PASS — bright enough to clearly see all architecture.
  // Dial back to dark tones once architecture is approved.
  material: {
    color: '#5a5045',       // Mid-tone warm stone — CLEARLY VISIBLE
    roughness: 0.85,        // Rough stone surface
    metalness: 0.05,        // Nearly pure dielectric
  },

  // ── Columns ──────────────────────────────────────────────────────────────
  // 4 large cylindrical columns positioned behind/to the sides of the pedestal.
  // They frame the composition symmetrically without occluding the camera path.
  columns: {
    radius: 0.6,
    height: 14,
    radialSegments: 16,     // Enough for smooth cylinder without heavy poly count
    // Each column: [x, y, z] world position.
    // Y = height/2 - 0.05 so the column base sits at the floor.
    positions: [
      [-5.0, 6.95, -4.0],   // Back-left
      [5.0,  6.95, -4.0],   // Back-right
      [-6.5, 6.95, 2.0],    // Front-left (wider, won't block camera)
      [6.5,  6.95, 2.0],    // Front-right
    ],
    // Per-column material override (null = use shared material)
    materialOverride: null,
    // Optional column base (plinth) — simple box at the base of each column
    base: {
      enabled: true,
      width: 1.4,
      height: 0.5,
      depth: 1.4,
    },
    // Optional column capital — simple box at the top of each column
    capital: {
      enabled: true,
      width: 1.3,
      height: 0.4,
      depth: 1.3,
    },
  },

  // ── Walls ────────────────────────────────────────────────────────────────
  // Very dark distant walls to eliminate the black void.
  // Positioned far enough that they catch minimal light and feel like
  // the edge of a vast chamber.
  walls: {
    // Back wall — behind the pedestal, closing the background void
    back: {
      width: 40,
      height: 16,
      position: [0, 7.95, -10],
      rotation: [0, 0, 0],
    },
    // Left wall
    left: {
      width: 30,
      height: 16,
      position: [-12, 7.95, 0],
      rotation: [0, Math.PI / 2, 0],
    },
    // Right wall
    right: {
      width: 30,
      height: 16,
      position: [12, 7.95, 0],
      rotation: [0, -Math.PI / 2, 0],
    },
    // Wall material override — DEBUG: bright enough to see wall surfaces
    materialOverride: {
      color: '#4a4238',     // Warm stone grey — CLEARLY VISIBLE
      roughness: 0.88,
      metalness: 0.03,
    },
  },

  // ── Arch (behind pedestal) ───────────────────────────────────────────────
  // Large pointed arch silhouette behind the pedestal.
  // Adds compositional framing and temple atmosphere.
  arch: {
    enabled: true,
    position: [0, 0, -6.5],
    // Arch dimensions
    innerWidth: 5.0,        // Opening width
    innerHeight: 8.0,       // Opening height to the crown
    thickness: 1.2,         // Depth of the arch (Z extent)
    pillarWidth: 1.5,       // Width of each side pillar
    totalHeight: 12.0,      // Total height including above the arch curve
    // Number of segments for the arch curve
    archSegments: 24,
    materialOverride: null, // null = use shared material
  },

  // ── Ceiling ──────────────────────────────────────────────────────────────
  // Optional ceiling plane to close the top of the chamber
  ceiling: {
    enabled: true,
    size: 40,
    position: [0, 16, 0],
    rotation: [Math.PI / 2, 0, 0],
    materialOverride: {
      color: '#3a342e',     // Ceiling stone — visible but darker than walls
      roughness: 0.9,
      metalness: 0.02,
    },
  },

  // ── Environment Lighting ─────────────────────────────────────────────────
  // Subtle cool fill lights to reveal chamber architecture silhouettes.
  // These are SEPARATE from SceneLighting (which lights the book/pedestal).
  // Keep intensities low so the book remains the hero focal point.
  lighting: {
    // ── DEBUG EVALUATION PASS ──────────────────────────────────────────────
    // Strong ambient + directional fills to make ALL architecture clearly visible.
    // Reduce these once architecture is approved.

    // Strong ambient — raises absolute floor brightness for all geometry
    ambient: {
      color: '#c8c0b8',     // Warm neutral
      intensity: 0.6,       // HIGH — ensures nothing is pure black
    },

    // Fill lights — strong, wide-reaching, low decay for maximum coverage
    fills: [
      // ── Warm key from above/behind — reveals stone surfaces with highlights ──
      {
        name: 'chamber-key-overhead',
        color: '#f0d8a8',     // Warm golden
        intensity: 30,
        position: [0, 14, -3], // High above, slightly behind — washes down on arch + walls
        distance: 40,
        decay: 1.5,           // Gentler falloff than physically realistic
      },
      // ── Back wall + arch face illumination ──
      {
        name: 'chamber-fill-back',
        color: '#d0c0a0',     // Warm stone tone
        intensity: 25,
        position: [0, 6, -4],  // In front of back wall — lights arch + back wall
        distance: 35,
        decay: 1.5,
      },
      // ── Left side — grazes left columns + left wall ──
      {
        name: 'chamber-fill-left',
        color: '#a0b8c8',     // Cool fill
        intensity: 20,
        position: [-10, 6, 0],
        distance: 35,
        decay: 1.5,
      },
      // ── Right side — grazes right columns + right wall ──
      {
        name: 'chamber-fill-right',
        color: '#a0b8c8',     // Cool fill
        intensity: 20,
        position: [10, 6, 0],
        distance: 35,
        decay: 1.5,
      },
      // ── Floor illumination — reveals the stone floor clearly ──
      {
        name: 'chamber-fill-floor-front',
        color: '#c8b898',     // Warm neutral
        intensity: 18,
        position: [0, 3, 5],   // In front, above floor level
        distance: 30,
        decay: 1.5,
      },
      // ── Floor behind pedestal ──
      {
        name: 'chamber-fill-floor-back',
        color: '#b0a898',
        intensity: 15,
        position: [0, 2, -6],
        distance: 30,
        decay: 1.5,
      },
      // ── Ceiling / upper architecture illumination ──
      {
        name: 'chamber-fill-ceiling',
        color: '#b8b0a8',     // Neutral warm
        intensity: 15,
        position: [0, 12, 0], // High up near ceiling
        distance: 30,
        decay: 1.5,
      },
    ],
  },
}

// ─── Chamber Floor ────────────────────────────────────────────────────────────
//
// Simple ground plane to serve as the floor of the dark chamber.
// Placed slightly below the pedestal base (Y = 0) to avoid Z-fighting or clipping.
//
export const FLOOR_CONFIG = {
  // Size of the plane (width and height). Made large enough to cover the visible area.
  size: 100,

  // Position: slightly below origin so the pedestal (at Y=0) sits on top.
  position: [0, -0.05, 0],

  // Rotation: -Math.PI / 2 to lay the plane flat on the XZ axes.
  rotation: [-Math.PI / 2, 0, 0],

  // Material settings: visible stone floor — DEBUG EVALUATION PASS
  material: {
    color: '#4a4440', // Mid-tone stone grey — CLEARLY VISIBLE
    roughness: 0.85,  // Rough stone
    metalness: 0.05,  // Mostly dielectric
  }
}
