import { createGlobalStyle } from 'styled-components';

// You would need a subtle scanline PNG image for this to work best.
// For now, this is a CSS generated one which is less ideal but demonstrates.
const scanlineEffect = `
  &::after {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    background: repeating-linear-gradient(
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.05) 3px,
      rgba(0, 0, 0, 0.05) 4px
    );
    opacity: 0.6; // Adjust opacity
    z-index: 9999; // Ensure it's on top
    mix-blend-mode: multiply; // Experiment with blend modes
  }
`;

const GlobalStyles = createGlobalStyle`
  body, html {
    margin: 0;
    padding: 0;
    overflow: hidden; /* We'll manage scroll on a per-page basis if needed */
    height: 100%;
    width: 100%;
    background-color: #000; /* Default bg for transitions */
    font-family: 'Press Start 2P', cursive;
    image-rendering: pixelated; /* Better for pixel art */
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
  }

  #root {
    height: 100vh;
    width: 100vw;
    position: relative; /* For absolute positioned overlays */
    /* ${scanlineEffect} // Uncomment if you want CSS scanlines globally */
  }

  * {
    box-sizing: border-box;
  }

  /* General retro button style that can be extended */
  .retro-button-base {
    font-family: 'Press Start 2P', cursive;
    color: white;
    border: 3px solid black;
    border-radius: 0px; /* Sharp edges */
    cursor: pointer;
    text-shadow: 2px 2px 0px rgba(0,0,0,0.7);
    transition: all 0.1s ease-out; /* Faster, snappier transitions */
    padding: 10px 15px;
    
    &:active {
      transform: translate(2px, 2px);
      box-shadow: none !important;
    }
  }
`;

export default GlobalStyles;