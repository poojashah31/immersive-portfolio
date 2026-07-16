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
  // Starting position — pulled well back, raised to center the composition
  startPosition: [0, 2.2, 8.5],
  // End position — dramatic close-up, camera at book level
  endPosition: [0, 1.5, 2.6],
  // The world-space focal point — aim at the book surface
  // Pedestal top = 0.94, book center above it = 1.1
  // We look slightly higher to center in frame vertically
  lookAt: [0, 1.2, 0],
  // Vertical field of view in degrees
  fov: 46,
  near: 0.1,
  far: 100,
}

// ─── Dolly Animation ─────────────────────────────────────────────────────────

export const DOLLY_CONFIG = {
  // Seconds before the camera begins moving (lets the scene fully render first)
  delay: 0.5,
  // Total duration of the camera push-in
  duration: 7.0,
  // GSAP ease — slow start, slow stop
  ease: 'power2.inOut',
}

// ─── Lighting ────────────────────────────────────────────────────────────────

export const LIGHTING_CONFIG = {
  // Warm ambient — soft base fill so the darkest shadows aren't pure void
  ambient: {
    color: '#c87030',
    intensity: 0.5,
  },
  // Key light — warm golden torch above and slightly in front of the book
  keyLight: {
    color: '#f59a30',
    intensity: 60,
    position: [0.5, 4.0, 2.5],
    distance: 14,
    decay: 2,
  },
  // Fill light — dim warm fill from front-left to soften shadow side
  fillLight: {
    color: '#c06a15',
    intensity: 25,
    position: [-2.5, 2.0, 3.0],
    distance: 10,
    decay: 2,
  },
  // Rim light — subtle warm separation from behind
  rimLight: {
    color: '#7a3d10',
    intensity: 15,
    position: [0, 2.5, -3.0],
    distance: 8,
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
// Pedestal geometry reference (Y values = center of each section):
//   Base:   height=0.12, center y=0.06  → top surface at y=0.12
//   Column: height=0.70, center y=0.47  → top surface at y=0.82
//   Top:    height=0.12, center y=0.88  → top surface at y=0.94
//
// Book rests on pedestal top surface at y≈0.94

export const PEDESTAL_CONFIG = {
  position: [0, 0, 0],
  // Base slab — wide foundation
  base: {
    width: 2.0,
    height: 0.12,
    depth: 2.0,
    y: 0.06,
  },
  // Middle column — narrower
  column: {
    width: 0.75,
    height: 0.70,
    depth: 0.75,
    y: 0.47,
  },
  // Top platform — book sits here
  top: {
    width: 1.4,
    height: 0.12,
    depth: 1.4,
    y: 0.88,
  },
  // Stone material — dark warm stone
  material: {
    color: '#1e1a16',
    roughness: 0.95,
    metalness: 0.02,
  },
}
