import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { motion } from 'framer-motion';
import vinylImage from '/vinyl.png';
import morphedImage from '/logo.png';

// --- Keyframes ---
const rotateAndPulse = keyframes`
  0% { transform: translate(-50%, -50%) rotate(-2deg) scale(1.25); filter: brightness(100%); }
  50% { transform: translate(-50%, -50%) rotate(2deg) scale(1.3); filter: brightness(120%); }
  100% { transform: translate(-50%, -50%) rotate(-2deg) scale(1.25); filter: brightness(100%); }
`;
const imageGlitchTransition = keyframes`
  0% { opacity: 1; filter: saturate(1) blur(0); transform: translate(-50%, -50%) scale(1.0); }
  25% { opacity: 0.7; filter: saturate(1.5) blur(0.5px) hue-rotate(10deg); transform: translate(-52%, -48%) scale(1.02); }
  50% { opacity: 1; filter: saturate(1) blur(0); transform: translate(-49%, -51%) scale(0.98); }
  75% { opacity: 0.6; filter: saturate(2) blur(0.2px) hue-rotate(-10deg); transform: translate(-50%, -50%) scale(1.01); }
  100% { opacity: 1; filter: saturate(1) blur(0); transform: translate(-50%, -50%) scale(1.0); }
`;
const neonGlowButton = keyframes`
  0%, 100% { box-shadow: 3px 3px 0px 0px #000000, 0 0 3px #fff, 0 0 7px #fff, 0 0 10px #A0F0F2, 0 0 15px #A0F0F2; }
  50% { box-shadow: 3px 3px 0px 0px #000000, 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #00FFD4, 0 0 25px #00FFD4; }
`;
const randomGlitch = keyframes`
  0%, 100% { transform: translate(0,0) translate(-50%, -50%); opacity: 1; }
  5% { transform: translate(2px, -1px) translate(-50%, -50%) skewX(-3deg); opacity: 0.8; }
  10% { transform: translate(-1px, 2px) translate(-50%, -50%) skewX(2deg); opacity: 1; }
  15% { transform: translate(1px, -2px) translate(-50%, -50%) skewX(-1deg); opacity: 0.7; }
  20% { transform: translate(0,0) translate(-50%, -50%); opacity: 1; }
  80% { transform: translate(0,0) translate(-50%, -50%); opacity: 1; }
  82% { transform: translate(-2px, 1px) translate(-50%, -50%) skewX(3deg) scale(1.02); opacity: 0.85; filter: brightness(1.5) contrast(1.3) hue-rotate(15deg); }
  84% { transform: translate(1px, -1px) translate(-50%, -50%) skewX(-2deg); opacity: 1; filter: none; }
  86% { transform: translate(0,0) translate(-50%, -50%); opacity: 1; }
`;
const crtScanlineRoll = keyframes`
  0% { background-position-y: 0px; }
  100% { background-position-y: 2px; }
`;
const crtSubtleFlicker = keyframes`
  0%, 100% { opacity: 1; } 49.8% { opacity: 1; } 50% { opacity: 0.95; } 50.2% { opacity: 1; }
`;

// --- CURSOR DEFINITIONS (Custom Images from public folder) ---
const cursorPointerCustom = 'url(/pointer.png), auto';
const cursorFingerCustom = 'url(/finger.png), pointer';

// --- Styled Components ---
const AppContainer = styled(motion.div)`
  font-family: 'Press Start 2P', cursive;
  background-color: #1ED760;
  width: 100vw; height: 100vh; margin: 0;
  position: relative; overflow: hidden;
  cursor: ${cursorPointerCustom}; 
`;

const CRTEffectOverlay = styled.div`
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  pointer-events: none; z-index: 10000;
  &::before { /* Scanlines & Noise */
    content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background-image: 
      linear-gradient(rgba(10, 10, 15, 0.22) 50%, transparent 50%),
      url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXWBgYGHh4d5eXlzc3OLi4ubm5uVlZWPj4+NjY19fX2JiYl/f39ra2uRkZGZmZlpaWmXl5dvb29xcXGTk5NnZ2c8TV1mAAAAG3RSTlNAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAvEOwtAAAAYklEQVRIx+3NMQEAIAwEQQRfSDRfYP7fWjF8xWcKAACzS/a9Y8DVAEgfRpsGABuR7YFkRkGABwLp_FEQABgS3lAZ9P32QjMhF4xGIAIAAG3Z1wANACp9vLzQADfD/nS4AAAAAElFTkSuQmCC');
    background-repeat: repeat, repeat;
    background-size: 100% 2px, 60px 60px; 
    animation: ${crtScanlineRoll} 0.2s linear infinite;
    opacity: 0.55;
  }
  &::after { /* Vignette & Flicker */
    content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    box-shadow: inset 0 0 130px 45px rgba(0, 0, 0, 0.5);
    animation: ${crtSubtleFlicker} 22s steps(1, end) infinite;
  }
`;

const MainImage = styled(motion.img)`
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  cursor: ${cursorFingerCustom}; 
  image-rendering: pixelated;
  object-fit: contain; 
  
  ${({ $applyGlitch, $isVinyl }) => {
    let hoverAnimation = 'none';
    if ($isVinyl && !$applyGlitch) { hoverAnimation = css`${rotateAndPulse} 1.5s infinite ease-in-out`; }
    let glitchPart = $applyGlitch ? css`${randomGlitch} 0.3s cubic-bezier(.25,.46,.45,.94) 1` : 'none';
    return css`
      animation: ${glitchPart};
      &:hover {
        animation: ${$applyGlitch ? glitchPart : hoverAnimation};
        ${!$isVinyl && !$applyGlitch && `filter: drop-shadow(0 0 10px #FFFFFF) brightness(1.1);`}
      }
    `;
  }}
  ${({ $isTransitioning }) => $isTransitioning && css`animation: ${imageGlitchTransition} 0.4s ease-in-out forwards !important;`}
`;

const StartButton = styled(motion.button)`
  font-family: 'Press Start 2P', cursive; color: white;
  border: 3px solid black; border-radius: 0px; 
  cursor: ${cursorFingerCustom}; 
  text-shadow: 2px 2px 0px rgba(0,0,0,0.7); padding: 12px 24px;
  font-size: 16px; background-color: #FA0004;
  box-shadow: 3px 3px 0px 0px #000000; position: absolute;
  &:hover { animation: ${neonGlowButton} 1.5s infinite ease-in-out; }
`;

const AppFooter = styled(motion.footer)`
  position: absolute; bottom: 0; left: 0; width: 100%;
  background-color: black; color: white; text-align: center;
  padding: 10px; font-size: 12px; text-shadow: 1px 1px 0px #1ED760;
`;

const pageVariants = {
  initial: { opacity: 0, filter: "blur(10px) contrast(200%)", scale: 1.2 },
  in: { opacity: 1, filter: "blur(0px) contrast(100%)", scale: 1 },
  out: { opacity: 0, filter: "blur(10px) contrast(50%)", scale: 0.8, transition: { duration: 0.3 } },
};

const App = () => {
  const [currentImage, setCurrentImage] = useState(vinylImage);
  const [isVinyl, setIsVinyl] = useState(true);
  const [imageSize, setImageSize] = useState({ width: 60, height: 60 });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [applyGlitchToLogo, setApplyGlitchToLogo] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() < 0.3) { 
        setApplyGlitchToLogo(true);
        const glitchDuration = 200 + Math.random() * 150;
        setTimeout(() => setApplyGlitchToLogo(false), glitchDuration);
      }
    }, 1500); 
    return () => clearInterval(glitchInterval);
  }, []);

  const handleImageClick = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setApplyGlitchToLogo(false);
    if (isVinyl) {
      setTimeout(() => {
        setCurrentImage(morphedImage);
        setIsVinyl(false);
        setImageSize({ width: 200, height: 'auto' }); 
        setShowButton(true);
        setIsTransitioning(false);
      }, 400);
    } else {
      navigate('/search');
    }
  };

  const handleStartButtonClick = () => { navigate('/search'); };

  let buttonTopPosition;
  if (showButton) {
      const approxLogoHalfHeight = 100; 
      const baseImageBottomOffset = isVinyl ? imageSize.height / 2 : (imageSize.height === 'auto' ? approxLogoHalfHeight / 2 : imageSize.height / 2);
      buttonTopPosition = `calc(50% + ${baseImageBottomOffset + 30}px)`;
  }

  return (
    <AppContainer
      initial="initial" animate="in" exit="out"
      variants={pageVariants}
      transition={{ duration: 0.5, type: 'tween', ease: "anticipate" }}
    >
      <MainImage
        src={currentImage}
        alt={isVinyl ? "Vinyl Record - Spotopia" : "Spotopia Logo"}
        $isVinyl={isVinyl}
        $isTransitioning={isTransitioning && isVinyl}
        $applyGlitch={applyGlitchToLogo && !isTransitioning}
        onClick={handleImageClick}
        animate={{ width: imageSize.width, height: imageSize.height }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 100 }}
      />
      {showButton && (
        <StartButton
          onClick={handleStartButtonClick}
          initial={{ opacity: 0, y: 20, x: "-50%", left: '50%' }}
          animate={{ opacity: 1, y: 0, x:"-50%", left: '50%', top: buttonTopPosition }}
          exit={{ opacity: 0, y: 20, x: "-50%", left: '50%' }}
          transition={{ delay: 0.2, duration: 0.3 }}
          whileHover={{ scale: 1.1, y: -3 }} whileTap={{ scale: 0.95 }}
        >Discover</StartButton>
      )}
      <AppFooter initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
        © {new Date().getFullYear()} Spotopia. Press Start.
      </AppFooter>
      <CRTEffectOverlay />
    </AppContainer>
  );
};
export default App;