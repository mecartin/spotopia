// src/main.jsx (Revised AnimatedRoutes for clarity)
import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import Search from './Search.jsx';
import Results from './Results.jsx';
import {
  createBrowserRouter,
  RouterProvider,
  useLocation,
  Outlet,
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion'; // Import motion
import GlobalStyles from './GlobalStyles';

const AnimatedOutlet = () => {
  const o = Outlet(); // Get the Outlet element
  // We need to give AnimatePresence a direct child with a changing key
  // and that child should be a motion component if it's going to be animated directly by AnimatePresence's props.
  // However, the typical pattern is that App, Search, Results are ALREADY motion components.
  // So AnimatePresence will work by detecting their key change when Outlet swaps them.
  
  // If App, Search, Results are NOT motion components at their root,
  // you'd wrap the Outlet's output:
  // if (o) {
  //   return <motion.div key={useLocation().pathname /* or o.props.childKey if available */} >{o}</motion.div>;
  // }
  // return null;

  // Since App, Search, Results ARE already motion components with variants,
  // just rendering Outlet with a key that AnimatePresence sees should be enough.
  // AnimatePresence is looking at its *direct* children for keys.
  return <Outlet />; // The key will be on the component *rendered* by Outlet
};


const AppLayout = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      {/* The key here ensures AnimatePresence re-evaluates when the path changes. */}
      {/* The actual component rendered by Outlet (App, Search, Results) will then animate based on its own variants. */}
      {React.cloneElement(<Outlet />, { key: location.pathname })}
    </AnimatePresence>
  );
};


const router = createBrowserRouter([
  {
    element: <AppLayout />, // Use the layout that handles AnimatePresence
    children: [
      {
        path: '/',
        element: <App />,
      },
      {
        path: '/search',
        element: <Search />,
      },
      {
        path: '/results',
        element: <Results />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalStyles />
    <RouterProvider router={router} />
  </StrictMode>
);