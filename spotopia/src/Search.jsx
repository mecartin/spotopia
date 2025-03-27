import React, { useState, useRef } from 'react';
import { styled, keyframes } from 'styled-components';
import morphedImage from '/logo.png';
import { Button, ProgressBar } from 'retro-react';
import { useNavigate } from 'react-router-dom';

// Styled Components
const PageContainer = styled.div`
  font-family: 'Press Start 2P', cursive;
  background-color: #1ED760;
  width: 100vw;
  height: 100vh;
  margin: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const LogoImage = styled.img`
  width: auto;
  height: auto;
  margin-bottom: 20px;
  transition: transform 0.3s ease-in-out;
  animation: floating 3s ease-in-out infinite;

  &:hover {
    transform: ${({ hoverDirection }) =>
      hoverDirection === 'right' ? 'rotate(5deg)' : 'rotate(-5deg)'};
  }
`;

const SearchInput = styled.input`
  padding: 10px;
  box-shadow: 3px 3px 0px 0px #000000;
  border: 5px solid #000000;
  margin-bottom: 20px;
  transition: all 0.5s ease-in-out;

  &:focus {
    outline: none;
    transform: scale(1.05);
    box-shadow: 5px 5px 0px 0px #A0F0F2;
  }
  &.shake {
    animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    perspective: 1000px;
  }
`;

const DiscoverButton = styled(Button)`
  background-color: #FA0004 !important;
  border-radius: 5px;
  box-shadow: 3px 3px 0px 0px #A0F0F2;
  transition: all 0.3s ease-in-out;

  &:hover {
    transform: scale(1.1);
    box-shadow: 5px 5px 0px 0px #00FFD4;
  }
`;

const Footer = styled.div`
  position: absolute;
  bottom: 20px;
  text-align: center;
  width: 100%;
  font-size: 0.8rem;
  color: #000;
  animation: pulse 2s infinite;
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
// Keyframes
const floatingAnimation = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const shakeAnimation = keyframes`
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
`;

const Search = () => {
  const [showButton, setShowButton] = useState(true);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showInput, setShowInput] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [hoverDirection, setHoverDirection] = useState(null);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  const handleButtonClick = () => {
    if (!inputValue.trim()) {
      // Shake input if empty
      const input = document.querySelector('input');
      input.classList.add('shake');
      setTimeout(() => {
        input.classList.remove('shake');
      }, 500);
      return;
    }

    setShowButton(false);
    setShowInput(false);
    setTimeout(() => {
      setShowProgressBar(true);
      startProgressBar();
    }, 500);
  };

  const startProgressBar = () => {
    setProgress(0);
    intervalRef.current = setInterval(() => {
      setProgress((prevProgress) => {
        const increment = Math.random() * 10;
        const newProgress = prevProgress + increment;
        if (newProgress >= 100) {
          clearInterval(intervalRef.current);
          setTimeout(() => {
            navigate('/results');
          }, 1000);
          return 100;
        }
        return newProgress;
      });
    }, 60);
  };

  const handleLogoHover = (e) => {
    const rect = e.target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    setHoverDirection(e.clientX > centerX ? 'right' : 'left');
  };

  const handleLogoLeave = () => {
    setHoverDirection(null);
  };

  return (
    <PageContainer>
      <LogoImage
        src={morphedImage}
        alt="Morphed Logo"
        onMouseEnter={handleLogoHover}
        onMouseLeave={handleLogoLeave}
        hoverDirection={hoverDirection}
      />

      {showInput && (
        <SearchInput
          type="text"
          placeholder="Drop your tunes here"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      )}

      {showButton && (
        <DiscoverButton onClick={handleButtonClick}>Discover</DiscoverButton>
      )}

      {showProgressBar && (
        <div style={{ height: '20px', width: '500px', maxWidth: '90%' }}>
          <ProgressBar
            animated
            color="black"
            colorBg="none"
            pattern="stripes"
            value={progress}
          />
        </div>
      )}

<AppFooter>© 2025 Spotopia</AppFooter>
    </PageContainer>
  );
};

export default Search;