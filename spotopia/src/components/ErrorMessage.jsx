import React from 'react';
import styled from 'styled-components';
import { Button } from 'retro-react';
import { useNavigate } from 'react-router-dom';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  margin: 20px 0;
  border: 3px solid #FA0004;
  background-color: rgba(250, 0, 4, 0.1);
  box-shadow: 5px 5px 0px 0px rgba(0, 0, 0, 0.5);
  font-family: 'Press Start 2P', monospace;
`;

const ErrorText = styled.div`
  color: #FA0004;
  margin-bottom: 15px;
  text-align: center;
  font-size: 0.9em;
`;

const RetryButton = styled(Button)`
  background-color: #FA0004 !important;
  border-radius: 5px;
  box-shadow: 3px 3px 0px 0px #A0F0F2;
  transition: all 0.3s ease-in-out;

  &:hover {
    transform: scale(1.1);
    box-shadow: 5px 5px 0px 0px #00FFD4;
  }
`;

const ErrorMessage = ({ message, retryAction, retryRoute = '/search', buttonText = 'Try Again' }) => {
  const navigate = useNavigate();
  const handleRetry = () => {
    if (retryAction) {
      retryAction(); // Call the passed function
    } else if (retryRoute) {
      navigate(retryRoute);
    }
  };
  return (
    <ErrorContainer>
      <ErrorText>{message}</ErrorText>
      <RetryButton onClick={handleRetry}>{buttonText}</RetryButton>
    </ErrorContainer>
  );
};
export default ErrorMessage;