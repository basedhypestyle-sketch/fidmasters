import React from 'react'
import { createRoot } from 'react-dom/client'
import { WagmiConfig } from 'wagmi'
import { config } from './wagmi'
import App from './app'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiConfig client={config}>
      <App />
    </WagmiConfig>
  </React.StrictMode>
)
