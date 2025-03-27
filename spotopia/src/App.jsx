import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import vinylImage from '/vinyl.png';
import morphedImage from '/logo.png';

const AppContainer = styled.div`
  font-family: 'Press Start 2P', cursive;
  background-color: #1ED760;
  width: 100vw;
  height: 100vh;
  margin: 0;
  position: relative;
  overflow: hidden;
`;

const MainImage = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: width 0.3s ease-in-out, opacity 0.3s ease-in-out,
    transform 0.3s ease-in-out;

  &:hover {
    animation: rotate-hover 0.5s infinite alternate;
    transform: translate(-50%, -50%) scale(1.3);
  }

  &.transitioning {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(0.7);
  }
`;

const StartButton = styled.div`
  position: absolute;
  transform: translateX(-50%);
  padding: 10px 20px;
  background-color: #FA0004;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    background-color: #ff3338;
    transform: translateX(-50%) scale(1.2);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }

  &.hidden {
    opacity: 0;
  }
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

const RotateHoverAnimation = keyframes`
  from {
    transform: translate(-50%, -50%) rotate(-5deg) scale(1.3);
  }
  to {
    transform: translate(-50%, -50%) rotate(5deg) scale(1.3);
  }
`;

const App = () => {
  const [currentImage, setCurrentImage] = useState(vinylImage);
  const [imageWidth, setImageWidth] = useState('60px');
  const [transitioning, setTransitioning] = useState(false);
  const [showDiv, setShowDiv] = useState(false);
  const [divShadow, setDivShadow] = useState('3px 3px 0px 0px #A0F0F2');
  const [divPosition, setDivPosition] = useState({
    top: 'calc(50% + 100px)',
    left: '50%',
  });

  const navigate = useNavigate();

  const handleImageClick = () => {
    if (transitioning) return;

    setTransitioning(true);

    if (currentImage === vinylImage) {
      setTimeout(() => {
        setCurrentImage(morphedImage);
        setImageWidth('auto');
        setShowDiv(true);
        setDivShadow('3px 3px 0px 0px #A0F0F2');
      }, 200);
    } else {
      setCurrentImage(vinylImage);
      setImageWidth('60px');
      setShowDiv(false);
      setDivShadow('3px 3px 0px 0px #A0F0F2');
      setDivPosition({
        top: 'calc(50% + 100px)',
        left: '50%',
      });
    }

    setTimeout(() => {
      setTransitioning(false);
    }, 300);
  };

  const handleDivClick = () => {
    if (showDiv) {
      setDivShadow('0px 0px 0px 0px transparent');
      setDivPosition({
        top: 'calc(50% + 103px)',
        left: 'calc(50% + 3px)',
      });

      setTimeout(() => {
        navigate('/search');
      }, 400);
    }
  };

  return (
    <AppContainer>
      <MainImage
        className={`main-image ${transitioning ? 'transitioning' : ''}`}
        onClick={handleImageClick}
        style={{
          width: imageWidth,
          height: 'auto',
        }}
        src={currentImage}
        alt="Vinyl or Morphed"
      />

      {showDiv && (
        <StartButton
          className={`start-button ${transitioning ? 'hidden' : ''}`}
          onClick={handleDivClick}
          style={{
            top: divPosition.top,
            left: divPosition.left,
            boxShadow: divShadow,
          }}
        >
          Discover
        </StartButton>
      )}

      <AppFooter>© 2025 Your Awesome App. All Rights Reserved.</AppFooter>
    </AppContainer>
  );
};

export default App;