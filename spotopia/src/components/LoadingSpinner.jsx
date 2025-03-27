import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pixelate = keyframes`
  0% { clip-path: inset(0 0 0 0); }
  25% { clip-path: inset(10% 0 0 20%); }
  50% { clip-path: inset(20% 10% 10% 0); }
  75% { clip-path: inset(0 20% 20% 10%); }
  100% { clip-path: inset(0 0 0 0); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid #000;
  border-radius: 50%;
  border-top: 5px solid #FA0004;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.div`
  font-family: 'Press Start 2P', monospace;
  font-size: 0.8em;
  animation: ${pixelate} 2s infinite;
  color: #000;
`;

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <Container>
      <SpinnerContainer>
        <Spinner />
      </SpinnerContainer>
      <LoadingText>{message}</LoadingText>
    </Container>
  );
};

export default LoadingSpinner;