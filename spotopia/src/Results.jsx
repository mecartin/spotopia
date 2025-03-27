import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import morphedImage from '/logo.png';
import { getRecommendations } from './lib/api';
import ErrorMessage from './components/ErrorMessage';
import LoadingSpinner from './components/LoadingSpinner';

// Keyframe animations
const cardSlideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const progressBarAnimation = keyframes`
  0% { width: 0%; }
  80% { width: 80%; }  // Stop at 80%
  100% { width: 80%; } // Hold at 80%
`;

const floatAnimation = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
`;

const cardSlideOut = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
`;

// Styled Components
const PageContainer = styled.div`
  background-color: #1ED760;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 20px;
  box-sizing: border-box;
  font-family: 'Press Start 2P', monospace;
  color: black;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;



const DiscoverButton = styled.button`
  background-color: #FA0004;
  color: black;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.8em;
  box-shadow: 3px 3px 0px 0px #A0F0F2;
  transition: transform 0.3s ease;
  font-family: 'Press Start 2P', monospace;
  &:hover {
    transform: scale(1.1);
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  text-align: right;
`;

const SearchLabel = styled.span`
  margin-bottom: 5px;
  font-size: 0.7em;
`;

const SearchTextContainer = styled.div`
  border: 3px solid black;
  border-radius: 3px;
  width: 200px;
  padding: 8px;
  box-shadow: 3px 3px 0px 0px rgba(0, 0, 0, 0.5);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 5px 5px 0px 0px rgba(0, 0, 0, 0.7);
  }
`;


const CardImage = styled.div`
  width: 100%;
  height: 150px;
  background-color: white;
  margin-bottom: 15px;
`;

const SongInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 5px;
`;

const SongTitleText = styled.p`
  font-weight: bold;
  font-size: 0.7em;
  margin: 0 0 5px 0;
`;

const ArtistName = styled.p`
  font-size: 0.6em;
  margin: 0;
  color: #333;
`;
const AppFooter = styled.footer`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: black;
  color: white;
  text-align: center;
  padding: 10px;
  font-size: 12px;
`;
const Navigation = styled.div`
  position: absolute;
  left: -50px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  margin-bottom: 10px;
  transition: color 0.3s ease;

  &:hover {
    color: #FA0004;
  }
`;

const Footer = styled.div`
  text-align: center;
  font-size: 0.7em;
  margin-top: auto;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.1);
`;

const ProgressBar = styled.div`
  width: 0%;
  height: 20px;
  width: 200px;
  background-color: #FA0004;
  animation: ${progressBarAnimation} 3s linear forwards;
  border-radius: 10px;
`;

const ContentContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
`;

const ArrowButton = styled.button`
  background: none;
  border: none;
  font-size: 2em;
  cursor: pointer;
  margin: 0 20px;
  transition: color 0.3s ease, transform 0.2s ease;
  color: black;

  &:hover {
    color: #FA0004;
    transform: scale(1.2);
  }

  &:disabled {
    color: rgba(0, 0, 0, 0.3);
    cursor: not-allowed;
  }
`;

const Card = styled.div`
  width: 200px;
  border: 4px solid black;
  padding: 15px;
  text-align: left;
  background-color: lightgray;
  box-shadow: 5px 5px 0px 0px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  animation: ${cardSlideIn} 0.5s ease-out;
  position: relative;
  transition: transform 0.3s ease, scale 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.1);
    z-index: 10;
  }
`;

const CardsWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  transition: transform 0.5s ease-in-out;

  &:hover ${Card}:not(:hover) {
    transform: scale(0.9);
  }
`;

const Logo = styled.img`
  height: 50px;
  animation: ${floatAnimation} 3s ease-in-out infinite;
  cursor: pointer;
`;

const Results = () => {
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [currentCardSet, setCurrentCardSet] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [inputSong, setInputSong] = useState(null);
  const navigate = useNavigate();

  // Load data from sessionStorage and fetch recommendations on component mount
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        
        // Get search query from session storage
        const query = sessionStorage.getItem('searchQuery');
        if (!query) {
          throw new Error('No search query found');
        }
        
        setSearchQuery(query);
        
        // Get search results from session storage
        const searchResultsJson = sessionStorage.getItem('searchResults');
        if (!searchResultsJson) {
          throw new Error('No search results found');
        }
        
        const searchResults = JSON.parse(searchResultsJson);
        
        // Check if we have any results
        if (!searchResults.results || searchResults.results.length === 0) {
          throw new Error('No matching songs found');
        }
        
        // Use the first result to get recommendations
        const firstResult = searchResults.results[0];
        const artistName = Array.isArray(firstResult.artists) 
          ? firstResult.artists[0] 
          : firstResult.artists;
        
        // Get recommendations based on the first search result
        const recommendationData = await getRecommendations(
          firstResult.name,
          artistName,
          8 // Get 8 recommendations (2 sets of 4)
        );
        
        // Set the input song and recommendations
        setInputSong(recommendationData.input_song);
        setRecommendations(recommendationData.recommendations);
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
        setError(err.message || 'Failed to get recommendations');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, []);

  const handleDiscoverClick = () => {
    setShowProgressBar(true);
    setTimeout(() => {
      setShowProgressBar(false);
      navigate('/search');
    }, 3000);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const goToPreviousSet = () => {
    if (currentCardSet > 0) {
      setCurrentCardSet((prev) => prev - 1);
    }
  };

  const goToNextSet = () => {
    const maxSets = Math.ceil(recommendations.length / 4) - 1;
    if (currentCardSet < maxSets) {
      setCurrentCardSet((prev) => prev + 1);
    }
  };

  // Calculate which songs to display based on current set
  const displayedSongs = recommendations.slice(
    currentCardSet * 4,
    currentCardSet * 4 + 4
  );

  // Loading state
  if (loading) {
    return (
      <PageContainer>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%'
        }}>
          <Logo src={morphedImage} alt="Spotopia Logo" />
          <LoadingSpinner message="Finding your perfect music match..." />
        </div>
      </PageContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <PageContainer>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%'
        }}>
          <Logo src={morphedImage} alt="Spotopia Logo" onClick={handleLogoClick} />
          <ErrorMessage 
            message={error} 
            retryRoute="/search" 
            buttonText="Try Again" 
          />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <Logo 
          src={morphedImage} 
          alt="Spotopia Logo" 
          onClick={handleLogoClick}
        />
        {showProgressBar ? (
          <ProgressBar />
        ) : (
          <DiscoverButton onClick={handleDiscoverClick}>Discover More</DiscoverButton>
        )}
        <SearchContainer>
          <SearchLabel>Similar To</SearchLabel>
          <SearchTextContainer>
            <span style={{ fontWeight: 'bold' }}>{inputSong?.name || searchQuery}</span>
            <div>{inputSong?.artists?.join(', ') || ''}</div>
          </SearchTextContainer>
        </SearchContainer>
      </Header>

      <ContentContainer>
        <ArrowButton 
          onClick={goToPreviousSet} 
          disabled={currentCardSet === 0}
        >
          ◀
        </ArrowButton>

        <CardsWrapper>
          {displayedSongs.map((song, index) => (
            <Card key={index}>
              <CardImage />
              <SongInfo>
                <div>
                  <SongTitleText>{song.name}</SongTitleText>
                  <ArtistName>
                    {Array.isArray(song.artists) 
                      ? song.artists.join(', ') 
                      : String(song.artists)}
                  </ArtistName>
                </div>
                <ArtistName>{song.year}</ArtistName>
              </SongInfo>
            </Card>
          ))}
        </CardsWrapper>

        <ArrowButton 
          onClick={goToNextSet} 
          disabled={currentCardSet >= Math.ceil(recommendations.length / 4) - 1}
        >
          ▶
        </ArrowButton>
      </ContentContainer>

      <AppFooter>© 2025 Spotopia</AppFooter>
    </PageContainer>
  );
};

export default Results;