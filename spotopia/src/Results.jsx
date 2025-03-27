import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import morphedImage from '/logo.png';

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
  const navigate = useNavigate();

  const songs = [
    { title: 'Cannonball', artist: 'The Breeders', duration: '3:35' },
    { title: 'Loser', artist: 'Beck', duration: '3:55' },
    { title: 'Today', artist: 'The Smashing Pumpkins', duration: '3:20' },
    { title: 'Sabotage', artist: 'Beastie Boys', duration: '2:58' },
    { title: 'Where Is My Mind?', artist: 'Pixies', duration: '3:40' },
    { title: 'Bullet with Butterfly Wings', artist: 'The Smashing Pumpkins', duration: '4:17' },
    { title: 'Blue Monday', artist: 'New Order', duration: '7:30' },
    { title: 'Under the Bridge', artist: 'Red Hot Chili Peppers', duration: '4:24' },
  ];

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
    setCurrentCardSet((prev) => prev + 1);
  };

  const displayedSongs = songs.slice(
    currentCardSet * 4,
    currentCardSet * 4 + 4
  );

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
            <span style={{ fontWeight: 'bold' }}>karma police</span>
            <div>radiohead</div>
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
                  <SongTitleText>{song.title}</SongTitleText>
                  <ArtistName>{song.artist}</ArtistName>
                </div>
                <ArtistName>{song.duration}</ArtistName>
              </SongInfo>
            </Card>
          ))}
        </CardsWrapper>

        <ArrowButton 
          onClick={goToNextSet} 
          disabled={currentCardSet === 1}
        >
          ▶
        </ArrowButton>
      </ContentContainer>

      <AppFooter>© 2025 Spotopia</AppFooter>
    </PageContainer>
  );
};

export default Results;