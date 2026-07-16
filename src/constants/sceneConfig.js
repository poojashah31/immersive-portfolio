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
  // End position — slightly elevated front view framing book on pedestal top
  endPosition: [0, 1.8, 3.5],
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
  duration: 3.5,
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
  background: '#050402', // Near pure black with a faint warm tone
  fog: {
    color: '#050402',
    near: 10,
    far: 28,
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
