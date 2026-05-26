import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Force light theme and override any stored dark mode
document.documentElement.setAttribute('data-theme', 'light');
localStorage.setItem('theme', 'light');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
