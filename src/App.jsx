import React from 'react'
import CanvasContainer from './components/CanvasContainer'

/**
 * Main application component.
 * Renders the CanvasContainer to fill the viewport.
 */
function App() {
  return (
    <main style={{ width: '100%', height: '100%', position: 'relative' }}>
      <CanvasContainer />
    </main>
  )
}

export default App
