import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import Search from './Search.jsx'; // Import the Search component
import Results from './Results.jsx'; // Import the Results component
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/search',
    element: <Search />, // Add the Search component for /search
  },
  {
    path: '/results',
    element: <Results />, // Add the Search component for /search
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);