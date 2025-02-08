/**
 * Game Center Application Entry Point
 * --------------------------------
 * Primary entry point for the React-based Game Center application.
 * 
 * Purpose:
 * - Initializes React application
 * - Sets up root rendering
 * - Configures strict mode
 * - Loads global styles
 * 
 * Data Flow:
 * 1. Initialization:
 *    - Imports React and ReactDOM
 *    - Imports root App component
 *    - Imports global styles
 * 
 * 2. DOM Setup:
 *    - Finds root element
 *    - Creates React root
 *    - Validates DOM structure
 * 
 * 3. Application Rendering:
 *    - Wraps App in StrictMode
 *    - Renders to root element
 *    - Enables React development features
 * 
 * Integration Points:
 * - App.tsx: Main application component
 * - index.css: Global Tailwind styles
 * - index.html: Root DOM element
 * 
 * Error Handling:
 * - Validates root element existence
 * - Throws descriptive error if missing
 * 
 * Development Features:
 * - Strict Mode enabled for:
 *   - Double-rendering checks
 *   - Deprecated API warnings
 *   - Side effect cleanup validation
 * 
 * @status ACTIVE and REQUIRED
 * - Critical application entry point
 * - Essential for React initialization
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Get root element and validate existence
const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

// Create React root and render application
createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);