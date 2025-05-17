import React, { useState, useRef, useEffect } from 'react';
import { styled, keyframes, css } from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { searchSongs } from './lib/api'; 
import ErrorMessage from './components/ErrorMessage';
import morphedImage from '/logo.png';

// --- Keyframes ---
const floatingLogo = keyframes`
  0% { transform: translateY(0px) rotate(-2deg); }
  50% { transform: translateY(-15px) rotate(2deg) scale(1.03); }
  100% { transform: translateY(0px) rotate(-2deg); }
`;
const shakeAnimation = keyframes`
  10%, 90% { transform: translate3d(-1px, 0, 0) rotate(-1deg); }
  20%, 80% { transform: translate3d(2px, 0, 0) rotate(1deg); }
  30%, 50%, 70% { transform: translate3d(-3px, 0, 0) rotate(-2deg); }
  40%, 60% { transform: translate3d(3px, 0, 0) rotate(2deg); }
`;
const inputFocusGlow = keyframes`
  0%, 100% { box-shadow: 3px 3px 0px 0px #000000, 0 0 5px #A0F0F2, 0 0 8px #A0F0F2; }
  50% { box-shadow: 3px 3px 0px 0px #000000, 0 0 8px #00FFD4, 0 0 12px #00FFD4; }
`;
const blinkingCursor = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;
const animatedStripes = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: 20px 0; }
`;
const textGlitch = keyframes`
  0%, 100% { transform: translate(0,0) skew(0deg); opacity: 1; text-shadow: 2px 2px 0px rgba(0,0,0,0.7); }
  25% { transform: translate(1px, -1px) skew(-2deg); opacity: 0.9; text-shadow: 2px 2px 0px #FA0004, -1px 1px 0px #00FFD4; }
  50% { transform: translate(-1px, 1px) skew(2deg); opacity: 1; text-shadow: 2px 2px 0px rgba(0,0,0,0.7); }
  75% { transform: translate(0px, 1px) skew(1deg); opacity: 0.85; text-shadow: 2px 2px 0px #A0F0F2, 1px -1px 0px #FA0004; }
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
const PageWrapper = styled(motion.div)`
  font-family: 'Press Start 2P', cursive;
  background-color: #1ED760;
  width: 100vw; height: 100vh; margin: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  overflow: hidden; padding: 20px; position: relative; 
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

const LogoImage = styled(motion.img)`
  width: auto; max-height: 130px; margin-bottom: 15px; 
  animation: ${floatingLogo} 3.5s ease-in-out infinite;
  cursor: ${cursorFingerCustom}; 
  image-rendering: pixelated;
  ${({ $applyGlitch }) => $applyGlitch && css`animation: ${floatingLogo} 3.5s ease-in-out infinite, ${textGlitch} 0.25s linear 2 alternate;`}
`;

const PageTitle = styled(motion.h1)`
  font-size: 2.5em; color: black;
  text-shadow: 3px 3px 0px #A0F0F2, -3px -3px 0px #FA0004; 
  margin-bottom: 25px; text-align: center; 
  ${({ $applyGlitch }) => $applyGlitch && css`animation: ${textGlitch} 0.3s ease-in-out 1;`}
`;

const InputContainer = styled(motion.div)`
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 25px;
`;

const SearchInput = styled(motion.input)`
  padding: 12px 15px; padding-right: 30px;
  box-shadow: 3px 3px 0px 0px #000000; border: 4px solid #000000;
  font-family: 'Press Start 2P', cursive; font-size: 1em;
  background-color: #f0f0f0; color: #333; caret-color: #FA0004;
  width: 350px; max-width: 90%; outline: none;
  cursor: text; 
  &:focus { animation: ${inputFocusGlow} 1.5s infinite ease-in-out; background-color: #fff; }
  ${({ $isShaking }) => $isShaking && css` animation: ${shakeAnimation} 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both, ${inputFocusGlow} 1.5s infinite ease-in-out; `}
  &::placeholder { color: #777; opacity: 0.8; }
`;

const BlinkingCursor = styled.span`
  position: absolute; right: 10px; top: 50%;
  transform: translateY(-50%); width: 8px; height: 20px;
  background-color: #FA0004;
  animation: ${blinkingCursor} 1s step-end infinite;
  display: ${({ $show }) => ($show ? 'block' : 'none')};
`;

const DiscoverButton = styled(motion.button)`
  background-color: #FA0004 !important; font-family: 'Press Start 2P', cursive; color: white;
  font-size: 1.1em; padding: 12px 25px; border: 3px solid black;
  text-shadow: 2px 2px 0px rgba(0,0,0,0.7); box-shadow: 4px 4px 0px 0px #000000;
  cursor: ${cursorFingerCustom}; 
  &:hover { background-color: #ff3338 !important; box-shadow: 4px 4px 0px 0px #A0F0F2, 0 0 8px #FF3338, 0 0 12px #FF3338 !important; }
  &:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0px 0px #000000, 0 0 8px #FF3338, 0 0 12px #FF3338 !important; }
`;

const CustomProgressBarContainer = styled(motion.div)`
  width: 500px; max-width: 90%; height: 25px; border: 3px solid black;
  background-color: rgba(0,0,0,0.2); overflow: hidden; box-shadow: 2px 2px 0px 0px black;
`;

const CustomProgressBarFill = styled(motion.div)`
  height: 100%;
  background-color: ${({ progress }) => progress < 33 ? '#FA0004' : progress < 66 ? '#FFEB3B' : '#00FFD4'};
  transition: background-color 0.3s linear;
  background-image: repeating-linear-gradient( 45deg, transparent, transparent 5px, rgba(0, 0, 0, 0.15) 5px, rgba(0, 0, 0, 0.15) 10px );
  animation: ${animatedStripes} 1s linear infinite;
`;

const AppFooter = styled(motion.footer)`
  position: absolute; bottom: 0; left: 0; width: 100%; background-color: black;
  color: white; text-align: center; padding: 10px; font-size: 12px;
  text-shadow: 1px 1px 0px #1ED760;
`;

const pageVariants = {
    initial: { opacity: 0, filter: "blur(5px)", scale: 1.1 },
    in: { opacity: 1, filter: "blur(0px)", scale: 1 },
    out: { opacity: 0, filter: "blur(5px)", scale: 0.9, transition: { duration: 0.3 } },
};

const USE_MOCK_SEARCH_BEHAVIOR = true; 
const MOCK_SEARCH_DELAY = 1200;

const Search = () => {
  const [showButton, setShowButton] = useState(true);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showInput, setShowInput] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [isInputShaking, setIsInputShaking] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const progressIntervalRef = useRef(null);
  const [applyGlitchToLogo, setApplyGlitchToLogo] = useState(false);
  const [applyGlitchToTitle, setApplyGlitchToTitle] = useState(false);

  useEffect(() => { 
    const logoGlitchInterval = setInterval(() => {
      if (Math.random() < 0.15) { 
        setApplyGlitchToLogo(true);
        setTimeout(() => setApplyGlitchToLogo(false), 250 + Math.random() * 100);
      }
    }, 2500);
    const titleGlitchInterval = setInterval(() => {
      if (Math.random() < 0.1) { 
        setApplyGlitchToTitle(true);
        setTimeout(() => setApplyGlitchToTitle(false), 300 + Math.random() * 100);
      }
    }, 3200);
    return () => { clearInterval(logoGlitchInterval); clearInterval(titleGlitchInterval); };
  }, []);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (error) setError(null);
  };

  const handleLogoClick = () => navigate('/');

  const startProgressBarSimulation = (onComplete) => {
    setShowProgressBar(true);
    setProgress(0);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    let currentProgress = 0;
    progressIntervalRef.current = setInterval(() => {
      currentProgress += Math.random() * 15 + 10;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(progressIntervalRef.current);
        setProgress(currentProgress);
        if (onComplete) setTimeout(onComplete, 200);
      } else {
        setProgress(currentProgress);
      }
    }, 150);
  };

  const handleDiscoverClick = async () => {
    if (!inputValue.trim()) {
      setIsInputShaking(true);
      setTimeout(() => setIsInputShaking(false), 400);
      return;
    }

    setShowButton(false);
    setShowInput(false);
    setError(null);

    if (USE_MOCK_SEARCH_BEHAVIOR) {
      console.log("Using MOCK search behavior.");
      sessionStorage.setItem('searchQuery', inputValue.trim());
      const mockSearchResults = {
        results: [ { name: inputValue.trim(), artists: ['Mock Searched Artist'], year: 2025, source: 'mock' } ]
      };
      sessionStorage.setItem('searchResults', JSON.stringify(mockSearchResults));
      startProgressBarSimulation(() => navigate('/results'));
    } else {
      startProgressBarSimulation(() => {});
      try {
        console.log("Using REAL API for Search page.");
        const searchResult = await searchSongs(inputValue.trim());
        sessionStorage.setItem('searchQuery', inputValue.trim());
        sessionStorage.setItem('searchResults', JSON.stringify(searchResult));
        if (progress < 100) {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            setProgress(100);
        }
        setTimeout(() => navigate('/results'), 200);
      } catch (err) {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        console.error('Search failed:', err);
        setError(err.message === "Failed to fetch" ? "Network error or backend unreachable. Try again?" : (err.message || 'Search failed. Please try again, warrior!'));
        setProgress(0);
        setShowProgressBar(false);
        setShowButton(true);
        setShowInput(true);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  return (
    <PageWrapper
      initial="initial" animate="in" exit="out"
      variants={pageVariants}
      transition={{ duration: 0.4, type: "tween", ease: "circOut" }}
    >
      <LogoImage
        src={morphedImage} alt="Spotopia Logo" onClick={handleLogoClick}
        whileHover={{ scale: 1.1, filter: "drop-shadow(0 0 8px #FFFFFF)" }}
        transition={{ type: 'spring', stiffness: 300 }}
        $applyGlitch={applyGlitchToLogo}
      />
      <PageTitle
        initial={{ opacity:0, y: -20 }} animate={{ opacity:1, y: 0 }}
        transition={{ delay:0.1, duration: 0.3 }}
        $applyGlitch={applyGlitchToTitle}
      >
        Find Your Vibe
      </PageTitle>
       {showInput && (
        <InputContainer initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}>
          <SearchInput
            type="text" placeholder="Drop your tunes here..."
            value={inputValue} onChange={handleInputChange}
            onFocus={() => setIsInputFocused(true)} onBlur={() => setIsInputFocused(false)}
            $isShaking={isInputShaking} aria-label="Search for a song"
          />
          <BlinkingCursor $show={isInputFocused && inputValue.length === 0} />
        </InputContainer>
      )}
      {error && !showProgressBar && (
         <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} style={{marginBottom: '15px'}}>
           <ErrorMessage 
             message={error} retryAction={handleDiscoverClick}
             buttonText="Retry Search"
           />
         </motion.div>
      )}
      {showButton && (
        <DiscoverButton
          onClick={handleDiscoverClick}
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98, y: 1 }}
        >
          Discover
        </DiscoverButton>
      )}
      {showProgressBar && (
        <CustomProgressBarContainer
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: '25px' }}
          transition={{ duration: 0.3, delay: USE_MOCK_SEARCH_BEHAVIOR ? 0 : 0.1 }} 
        >
          <CustomProgressBarFill
            initial={{ width: "0%" }} animate={{ width: `${progress}%` }}
            transition={{ duration: 0.15, ease: "linear" }}
            progress={progress}
          />
        </CustomProgressBarContainer>
      )}
      <AppFooter initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.5 }}>
        © {new Date().getFullYear()} Spotopia. Ready to Rock?
      </AppFooter>
      <CRTEffectOverlay />
    </PageWrapper>
  );
};
export default Search;