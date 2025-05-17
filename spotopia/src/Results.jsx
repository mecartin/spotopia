import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import morphedImage from '/logo.png';
import { getRecommendations } from './lib/api';
import ErrorMessage from './components/ErrorMessage';
import LoadingSpinner from './components/LoadingSpinner';

// --- Keyframes ---
const floatAnimation = keyframes`
  0% { transform: translateY(0px) rotate(-1deg); }
  50% { transform: translateY(-8px) rotate(1deg) scale(1.02); }
  100% { transform: translateY(0px) rotate(-1deg); }
`;
const cardIntenseHoverEffect = keyframes`
  0% { transform: translate(0, 0) skew(0deg); filter: blur(0px) drop-shadow(2px 2px 3px rgba(0,255,212,0.7)) brightness(1.05); opacity: 1; }
  20% { transform: translate(-4px, 2px) skewX(6deg) scale(1.01); filter: blur(5px) drop-shadow(3px 3px 5px rgba(255,0,80,0.8)) brightness(1.1); opacity: 0.75; }
  40% { transform: translate(3px, -3px) skewX(-4deg) scale(1.02); filter: blur(6px) drop-shadow(2px 2px 4px rgba(0,150,255,0.7)) brightness(1.15); opacity: 0.85; }
  60% { transform: translate(-2px, 1px) skewY(3deg) scale(1.01); filter: blur(5px) drop-shadow(3px 3px 5px rgba(200,0,255,0.8)) brightness(1.1); opacity: 0.8; }
  80% { transform: translate(1px, -1px) skew(0deg) scale(1); filter: blur(2px) drop-shadow(2px 2px 3px rgba(0,255,212,0.7)) brightness(1.05); opacity: 0.9; }
  100% { transform: translate(0, 0) skew(0deg) scale(1); filter: blur(0px) drop-shadow(2px 2px 3px rgba(0,255,212,0.7)) brightness(1.05); opacity: 1; }
`;
const scanlineSweep = keyframes`
  0% { background-position: 0% 0%; }
  100% { background-position: 0% 100%; }
`;
const itemGlitch = keyframes`
  0%, 100% { transform: translate(0,0) skew(0deg); opacity: 1; }
  10% { transform: translate(-2px, 1px) skewX(5deg) scale(1.01); opacity: 0.75; filter: hue-rotate(10deg); }
  20% { transform: translate(1px, -1px) skewX(-3deg); opacity: 1; filter: hue-rotate(0deg); }
  30% { transform: translate(0,0) skew(0deg); opacity: 1; }
`;
const clarifyArtEffect = keyframes`
  0% { filter: blur(8px) grayscale(40%) brightness(0.9); transform: scale(1.05); opacity: 0.8; }
  100% { filter: blur(0px) grayscale(0%) brightness(1); transform: scale(1); opacity: 1; }
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

// --- Base for Marquee Text Elements (Refined) ---
const MarqueeTextBase = css`
  overflow: hidden;
  white-space: nowrap;
  width: 100%;

  > .marquee-content {
    display: inline-block; 
    transform: translateX(0);
    transition: transform 4s linear 0.3s; 
    will-change: transform;
    padding-right: 1.5em; 
  }
`;

// --- Styled Components ---
const PageWrapper = styled(motion.div)`
  background-color: #1ED760; width: 100vw; height: 100vh;
  margin: 0; padding: 20px; font-family: 'Press Start 2P', monospace;
  color: black; display: flex; flex-direction: column;
  overflow: hidden; box-sizing: border-box;
  cursor: ${cursorPointerCustom}; 
  position: relative;
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

const Header = styled(motion.div)`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 10px; width: 100%; position: relative;
`;
const HeaderLeft = styled(motion.div)`
  display: flex; align-items: center; cursor: ${cursorFingerCustom};
`;
const Logo = styled(motion.img)`
  height: 40px; animation: ${floatAnimation} 3s ease-in-out infinite;
  ${({ $applyGlitch }) => $applyGlitch && css`animation: ${floatAnimation} 3s ease-in-out infinite, ${itemGlitch} 0.3s linear infinite alternate;`}
  cursor: ${cursorFingerCustom}; image-rendering: pixelated; margin-right: 10px;
`;
const ResultsTitle = styled(motion.h1)`
  font-size: 1.8em; color: black;
  text-shadow: 2px 2px 0px #A0F0F2, -2px -2px 0px #FA0004;
  text-align: center; flex-grow: 1; margin: 0 15px;
  ${({ $applyGlitch }) => $applyGlitch && css`animation: ${itemGlitch} 0.25s ease-in-out 1;`}
`;
const HeaderRight = styled(motion.div)`
  display: flex; flex-direction: column; align-items: flex-end; margin-right: 15px;
`;
const DiscoverMoreButton = styled(motion.button)`
  font-family: 'Press Start 2P', cursive; color: white; border: 3px solid black;
  border-radius: 0px; cursor: ${cursorFingerCustom}; text-shadow: 1px 1px 0px rgba(0,0,0,0.7);
  padding: 8px 15px; font-size: 0.7em; background-color: #FA0004;
  box-shadow: 2px 2px 0px 0px #000000; margin-bottom: 8px;
  &:hover { background-color: #ff3338; box-shadow: 2px 2px 0px 0px #A0F0F2, 0 0 5px #FF3338, 0 0 8px #FF3338; }
  &:active { transform: translate(1px, 1px); box-shadow: 0px 0px 0px 0px #A0F0F2 !important; }
`;
const SearchContextContainer = styled(motion.div)`
  display: flex; align-items: flex-end; flex-direction: column; text-align: right;
`;
const SearchContextLabel = styled.span`
  margin-bottom: 4px; font-size: 0.6em; color: rgba(0,0,0,0.9);
  text-shadow: 1px 1px 0px rgba(255,255,255,0.2);
`;
const SearchContextText = styled(motion.div)`
  border: 2px solid black; background-color: rgba(255,255,255,0.75);
  min-width: 150px; max-width: 200px; padding: 6px 8px;
  box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.5);
  .song-name, .artist-names { 
    display: block; 
    ${MarqueeTextBase} 
    &:hover > .marquee-content { 
      transform: translateX(-65%);
    }
  }
  .song-name { font-weight: bold; font-size: 0.65em; margin-bottom: 2px; }
  .artist-names { font-size: 0.55em; color: #333; }
  &:hover { transform: scale(1.02); box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.7); background-color: rgba(255,255,255,0.9); }
`;
const ContentContainer = styled(motion.div)`
  flex-grow: 1; display: flex; justify-content: center; align-items: center;
  position: relative; width: 100%; margin-top: 10px;
`;
const ArrowButton = styled(motion.button)`
  background: none; border: none; font-size: 2.5em; cursor: ${cursorFingerCustom};
  color: black; text-shadow: 2px 2px 0px rgba(255,255,255,0.3);
  padding: 0 15px; z-index: 20;
  &:hover:not(:disabled) { color: #FA0004; filter: drop-shadow(1px 1px 2px #000); }
  &:disabled { color: rgba(0,0,0,0.3); cursor: ${cursorPointerCustom}; filter: none; }
`;
const CardsWrapper = styled(motion.div)`
  display: flex; justify-content: center; align-items: stretch;
  gap: 18px; height: 280px; position: relative;
  width: calc(190px * 4 + 18px * 3); max-width: 100%;
`;

const Card = styled(motion.div)`
  width: 190px; height: 100%; border: 3px solid black; padding: 10px;
  text-align: left; background-color: #e0e0e0;
  box-shadow: 3px 3px 0px 0px rgba(0, 0, 0, 0.6); display: flex;
  flex-direction: column; justify-content: space-between;
  cursor: ${cursorFingerCustom}; overflow: hidden; position: relative;
  
  &::before { 
    content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background-image: repeating-linear-gradient(transparent, transparent 1px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 3px);
    background-size: 100% 6px; opacity: 0; transition: opacity 0.3s ease-in-out;
    animation: ${scanlineSweep} 10s linear infinite paused; pointer-events: none;
  }
  &:hover::before { opacity: 0.5; animation-play-state: running; }

  &:hover { 
    animation: ${cardIntenseHoverEffect} 0.7s ease-out 1; 
    border-color: #A0F0F2;
    
    .marquee-content { 
       transform: translateX(-70%); 
    }
  }
`;
const CardImagePlaceholder = styled.div`
  width: 100%; height: 130px; background-color: #555; margin-bottom: 8px;
  border: 2px solid black; display: flex; align-items: center; justify-content: center;
  font-size: 0.7em; color: #ccc;
  background-image: linear-gradient(45deg, #444 25%, transparent 25%), linear-gradient(-45deg, #444 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #444 75%), linear-gradient(-45deg, transparent 75%, #444 75%);
  background-size: 8px 8px; background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
  position: relative; overflow: hidden;
  animation: ${clarifyArtEffect} 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s forwards;
`;
const SongInfo = styled.div` display: flex; flex-direction: column; justify-content: space-between; flex-grow: 1; `;
const SongDetails = styled.div``;

const SongTitleText = styled.p`
  font-weight: bold; font-size: 0.7em; margin: 0 0 3px 0; color: #111;
  line-height: 1.2em; max-height: 1.2em; 
  ${MarqueeTextBase} 
`;
const ArtistName = styled.p`
  font-size: 0.6em; margin: 0; color: #444;
  line-height: 1.3em; max-height: 1.3em; 
  ${MarqueeTextBase} 
`;
const SongYear = styled.p` font-size: 0.6em; margin-top: 4px; color: #222; align-self: flex-end; `;
const AppFooter = styled(motion.footer)`
  position: absolute; bottom: 0; left: 0; width: 100%;
  background-color: black; color: white; text-align: center;
  padding: 10px; font-size: 12px; text-shadow: 1px 1px 0px #1ED760;
  box-sizing: border-box;
`;
const LoadingContainer = styled(motion.div)`
 display: flex; flex-direction: column; align-items: center; justify-content: center;
 height: 100%; width: 100%;
`;
const pageVariants = {
  initial: { opacity: 0, scale: 0.9, filter: "blur(3px)" },
  in: { opacity: 1, scale: 1, filter: "blur(0px)" },
  out: { opacity: 0, scale: 1.1, filter: "blur(3px)", transition: { duration: 0.3 } },
};
const cardContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const cardItemVariants = {
  hidden: { y: 25, opacity: 0, scale: 0.95, filter: "blur(1px)" },
  visible: { y: 0, opacity: 1, scale: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 120, damping: 14 } },
};

const USE_MOCK_DATA = true; 
const MOCK_DELAY = 1500;

const getMockRecommendations = () => {
    const mockInputSong = { name: "Art Pop Anthems For You", artists: ["Various Artists"], year: new Date().getFullYear() };
    const artPopSongs = [
        { id: "mock-ap-1", name: "Running Up That Hill (A Deal with God) - Extended Remix Version from 1985", artists: ["Kate Bush"], year: 1985, popularity: 90 },
        { id: "mock-ap-2", name: "Hyperballad In The Hall of The Mountain King", artists: ["Björk Guðmundsdóttir & Strengjasveitin"], year: 1995, popularity: 88 },
        { id: "mock-ap-3", name: "Cellophane Memories of a Past Life", artists: ["FKA twigs"], year: 2019, popularity: 85 },
        { id: "mock-ap-4", name: "Cruel Summer Night Grooves (Midnight Mix)", artists: ["St. Vincent & The Horn Section"], year: 2011, popularity: 82 },
        { id: "mock-ap-5", name: "Oblivion ft. The Digital Ghosts of Tomorrow", artists: ["Grimes"], year: 2012, popularity: 86 },
        { id: "mock-ap-6", name: "So Hot You're Hurting My Feelings (And I Kind Of Like It)", artists: ["Caroline Polachek"], year: 2019, popularity: 80 },
        { id: "mock-ap-7", name: "Two Weeks Notice For The End Of The World", artists: ["Grizzly Bear", "Victoria Legrand"], year: 2009, popularity: 78 },
        { id: "mock-ap-8", name: "Pangolin Love Song (Acoustic Version)", artists: ["Caroline Polachek"], year: 2019, popularity: 79 },
        { id: "mock-ap-9", name: "Venus as a Boy, Mars as a Man, Jupiter as a Concept", artists: ["Björk"], year: 1993, popularity: 87 },
        { id: "mock-ap-10", name: "Digital Witness Protection Program Soundtrack", artists: ["St. Vincent"], year: 2014, popularity: 81 },
        { id: "mock-ap-11", name: "Mary Magdalene (Sinner's Reprise)", artists: ["FKA twigs"], year: 2019, popularity: 83 },
        { id: "mock-ap-12", name: "Hounds of Love (Unleashed Kennel Club Mix)", artists: ["Kate Bush"], year: 1985, popularity: 89 },
    ];
    return { input_song: mockInputSong, recommendations: artPopSongs.slice(0, 12) };
};

const Results = () => {
  const [currentCardSet, setCurrentCardSet] = useState(0);
  const [searchQuery, setSearchQuery] = useState("Mock Search Query");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [inputSong, setInputSong] = useState(null);
  const navigate = useNavigate();
  const [applyGlitchToLogo, setApplyGlitchToLogo] = useState(false);
  const [applyGlitchToTitle, setApplyGlitchToTitle] = useState(false);

  const CARDS_PER_SET = 4;

  useEffect(() => {
    const logoGlitchInterval = setInterval(() => { if (Math.random() < 0.12) { setApplyGlitchToLogo(true); setTimeout(() => setApplyGlitchToLogo(false), 200 + Math.random() * 100); }}, 2800);
    const titleGlitchInterval = setInterval(() => { if (Math.random() < 0.08) { setApplyGlitchToTitle(true); setTimeout(() => setApplyGlitchToTitle(false), 280 + Math.random() * 100); }}, 3500);
    return () => { clearInterval(logoGlitchInterval); clearInterval(titleGlitchInterval); };
  }, []);

  const fetchRecommendationsData = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
        const mockData = getMockRecommendations();
        setInputSong(mockData.input_song);
        setRecommendations(mockData.recommendations || []);
        const storedQuery = sessionStorage.getItem('searchQuery');
        setSearchQuery(storedQuery || mockData.input_song?.name || "Art Pop Gems");
      } else { 
        const query = sessionStorage.getItem('searchQuery');
        if (!query) throw new Error('No search query found in session.');
        setSearchQuery(query);
        const searchResultsJson = sessionStorage.getItem('searchResults');
        if (!searchResultsJson) throw new Error('No search results found in session.');
        const searchResults = JSON.parse(searchResultsJson);
        if (!searchResults.results || searchResults.results.length === 0) {
          throw new Error('No matching songs found for your query.');
        }
        const firstResult = searchResults.results[0];
        const artistName = Array.isArray(firstResult.artists) ? firstResult.artists[0] : firstResult.artists;
        const recommendationData = await getRecommendations(firstResult.name, artistName, 12); 
        setInputSong(recommendationData.input_song);
        setRecommendations(recommendationData.recommendations || []);
      }
    } catch (err) { 
        console.error('Failed to fetch recommendations:', err);
        setError(err.message || 'Could not fetch recommendations. Try another tune!');
        setRecommendations([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRecommendationsData(); }, [fetchRecommendationsData]);

  const handleDiscoverClick = () => navigate('/search');
  const handleLogoClick = () => navigate('/');
  const totalSets = recommendations ? Math.ceil(recommendations.length / CARDS_PER_SET) : 0;
  const goToPreviousSet = () => setCurrentCardSet((prev) => Math.max(0, prev - 1));
  const goToNextSet = () => setCurrentCardSet((prev) => Math.min(totalSets - 1, prev + 1));
  const displayedSongs = recommendations.slice(currentCardSet * CARDS_PER_SET, (currentCardSet + 1) * CARDS_PER_SET);
  
  if (loading) {
    return (
      <PageWrapper initial="initial" animate="in" exit="out" variants={pageVariants}>
        <LoadingContainer>
          <Logo src={morphedImage} alt="Spotopia Loading..." style={{ height: '60px', marginBottom: '20px', marginRight: 0 }} $applyGlitch={applyGlitchToLogo} />
          <LoadingSpinner message={USE_MOCK_DATA ? "Conjuring Mock Art Pop..." : "Finding your perfect music match..."} />
        </LoadingContainer>
        <CRTEffectOverlay />
      </PageWrapper>
    );
  }
  if (error && recommendations.length === 0) {
    return (
      <PageWrapper initial="initial" animate="in" exit="out" variants={pageVariants}>
        <LoadingContainer> 
          <Logo src={morphedImage} alt="Spotopia Error" onClick={handleLogoClick} style={{ height: '60px', marginBottom: '20px', marginRight: 0 }} $applyGlitch={applyGlitchToLogo} />
          <ErrorMessage message={error} retryAction={fetchRecommendationsData} buttonText="Try Again" />
        </LoadingContainer>
        <CRTEffectOverlay />
      </PageWrapper>
    );
  }
  
  return (
    <PageWrapper initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.4, type: "easeOut" }}>
      <Header initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.4 }}>
         <HeaderLeft onClick={handleLogoClick} $applyGlitch={applyGlitchToLogo && !loading && !error}>
            <Logo src={morphedImage} alt="Spotopia Logo" whileHover={{ scale: 1.1, filter: "drop-shadow(0 0 5px #FFFFFF)"}} $applyGlitch={applyGlitchToLogo && !loading && !error} />
        </HeaderLeft>
        <ResultsTitle $applyGlitch={applyGlitchToTitle && !loading && !error}>Recommendations</ResultsTitle>
        <HeaderRight>
            <DiscoverMoreButton onClick={handleDiscoverClick} whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.98, y: 1 }} > Discover More </DiscoverMoreButton>
            <SearchContextContainer initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
            <SearchContextLabel>Similar To:</SearchContextLabel>
            <SearchContextText>
                <span className="song-name"><span className="marquee-content">{inputSong?.name || searchQuery}</span></span>
                {inputSong?.artists && (<span className="artist-names"><span className="marquee-content">{inputSong.artists.join(', ')}</span></span>)}
            </SearchContextText>
            </SearchContextContainer>
        </HeaderRight>
      </Header>
      <ContentContainer>
        <ArrowButton onClick={goToPreviousSet} disabled={currentCardSet === 0} whileHover={{ scale: 1.15, x: -3 }} whileTap={{ scale: 0.9 }} aria-label="Previous recommendations">◀</ArrowButton>
        <CardsWrapper key={currentCardSet} variants={cardContainerVariants} initial="hidden" animate="visible">
          {displayedSongs.map((song, index) => (
            <Card key={song.id || index} variants={cardItemVariants} whileHover={{ y: -8, scale: 1.03, zIndex: 10, boxShadow: "5px 5px 0px 0px rgba(0,0,0,0.75)"}} whileTap={{ scale: 0.97 }}>
              <CardImagePlaceholder>ART</CardImagePlaceholder>
              <SongInfo>
                <SongDetails>
                  <SongTitleText><span className="marquee-content">{song.name}</span></SongTitleText>
                  <ArtistName><span className="marquee-content">{Array.isArray(song.artists) ? song.artists.join(', ') : String(song.artists)}</span></ArtistName>
                </SongDetails>
                <SongYear>{song.year}</SongYear>
              </SongInfo>
            </Card>
          ))}
          {Array(Math.max(0, CARDS_PER_SET - displayedSongs.length)).fill(null).map((_, i) => ( <motion.div key={`empty-${i}`} style={{width: '190px', opacity:0}} variants={cardItemVariants}></motion.div> ))}
        </CardsWrapper>
        <ArrowButton onClick={goToNextSet} disabled={currentCardSet >= totalSets - 1 || totalSets === 0} whileHover={{ scale: 1.15, x: 3 }} whileTap={{ scale: 0.9 }} aria-label="Next recommendations">▶</ArrowButton>
      </ContentContainer>
      <AppFooter initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.5 }}>
        © {new Date().getFullYear()} Spotopia. Keep Discovering!
      </AppFooter>
      <CRTEffectOverlay />
    </PageWrapper>
  );
};
export default Results;