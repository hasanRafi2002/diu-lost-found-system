import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Add viewport meta tag programmatically
document.head.appendChild(Object.assign(document.createElement('meta'), {
  name: 'viewport',
  content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
}))

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
